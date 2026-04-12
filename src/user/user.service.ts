import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UploadMediaDto } from 'src/_cores/globals/dtos';
import { FriendRequest } from 'src/friend/schemas/friend-request.schemas';
import { Post } from 'src/post/schemas/post.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(FriendRequest.name) private friendModel: Model<FriendRequest>,
  ) { }

  // ...existing code...
  async findAll(
    currentUser: IUserPayload,
    q: string,
    limit: number,
    cursor: string,
  ) {
    const query: Record<string, any> = {
      isActive: true,
      _id: { $ne: currentUser._id }, // 👈 exclude current user
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (cursor) {
      query.email = { $gt: cursor };
    }

    const user = await this.findOne(currentUser._id);
    const friendIds = new Set(
      (user.friends || []).map((fr) => fr._id.toString()),
    );
    const sentRequests = await this.friendModel
      .find({ sender: currentUser._id, status: 'pending' })
      .select('receiver sender')
      .lean();

    const sentRequestReceiverIds = new Set(
      sentRequests.map((req) => req.receiver._id.toString()),
    );

    const users = await this.userModel
      .find(query)
      .sort({ email: 1 })
      .limit(limit + 1)
      .lean();
    const hasNextPage = users.length > limit;
    const items = (hasNextPage ? users.slice(0, limit) : users).map((user) => ({
      ...user,
      isFriend: friendIds.has(user._id.toString()),
      isSentFriendRequest: sentRequestReceiverIds.has(user._id.toString()),
    }));

    // --- If a query string is provided, also search posts related to q and visible to currentUser ---
    let postsResults: any[] = [];
    let postsHasNextPage = false;
    let postsCursor: any = null;

    if (q) {
      const regex = new RegExp(q, 'i');
      const friendIdsArray = Array.from(friendIds).map(
        (id) => new Types.ObjectId(id),
      );

      const postQuery: any = {
        $or: [
          // public posts matching query
          { $and: [{ content: { $regex: regex } }, { privacy: 'public' }] },
          // friends posts where author is current user's friend
          {
            $and: [
              { content: { $regex: regex } },
              { privacy: 'friends' },
              { author: { $in: friendIdsArray } },
            ],
          },
          // private posts authored by current user
          {
            $and: [
              { content: { $regex: regex } },
              { privacy: 'private' },
              { author: currentUser._id },
            ],
          },
        ],
      };

      if (cursor) {
        // apply same createdAt cursor for posts (useful for paging posts separately)
        postQuery.$and = postQuery.$and || [];
        postQuery.$and.push({ createdAt: { $lt: new Date(cursor) } });
        // keep $or clauses intact
      }

      const posts = await this.postModel
        .find(postQuery)
        .populate('author')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      postsHasNextPage = posts.length > limit;
      postsResults = postsHasNextPage ? posts.slice(0, limit) : posts;
      postsCursor = postsHasNextPage
        ? postsResults[postsResults.length - 1].createdAt
        : null;
    }
    return {
      items: {
        users: items,
        posts: postsResults,
      },
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].email : null,
      posts: postsResults, // added posts results (empty array when no q)
      postsHasNextPage,
      postsCursor,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findOne({
      _id: userId,
      isActive: true,
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ _id: id, isActive: true });
    if (!user) throw new NotFoundException('User does not exist');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...updateUserDto,
      },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
  }

  async uploadAvatar(
    uploadMediaDto: UploadMediaDto,
    currentUser: IUserPayload,
  ) {
    const user = await this.userModel.findById(currentUser._id);
    if (!user) throw new NotFoundException('User not found');

    user.avatar = uploadMediaDto;
    return user.save();
  }

  async uploadCoverPhoto(
    uploadMediaDto: UploadMediaDto,
    currentUser: IUserPayload,
  ) {
    const user = await this.userModel.findById(currentUser._id);
    if (!user) throw new NotFoundException('User not found');

    user.coverPhoto = uploadMediaDto;
    return user.save();
  }

  async addFriend(userId: string, friendId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendId },
    });
  }

  async getFriends(userId: string) {
    const user = await this.userModel.findById(userId).populate('friends');

    if (!user) throw new NotFoundException('User not found');
    return user.friends;
  }

  async checkIsFriend(userId: string, friendId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('friends');
    if (!user) return false;
    return user.friends.map((fr) => fr._id.toString()).includes(friendId);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true },
    );
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) {
      throw new BadRequestException(
        'This account uses Google login. Please sign in with Google.',
      );
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new NotFoundException('Current password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      throw new NotFoundException('New passwords do not match');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return { message: 'Password updated successfully' };
  }
}

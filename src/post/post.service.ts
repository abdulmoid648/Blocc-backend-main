import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Connection, Model, Types } from 'mongoose';
import { UploadMediaDto } from 'src/_cores/globals/dtos';
import { NotificationService } from 'src/notification/notification.service';
import { ReactionService } from 'src/reaction/reaction.service';
import { UserService } from 'src/user/user.service';
import { AddReactionDto } from './dto/add-reaction.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { RemoveReactionDto } from './dto/remove-reaction.dto';
import { ResponsePostReactionDto } from './dto/response-post-reaction.dto';
import { ResponsePostDto } from './dto/response-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostGateway } from './post.gateway';
import { Post } from './schemas/post.schema';
import { FriendRequest } from 'src/friend/schemas/friend-request.schemas';
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectConnection() private readonly connection: Connection,
    private reactionService: ReactionService,
    private notificationService: NotificationService,
    private userService: UserService,
    private postGateway: PostGateway,
    @InjectModel(FriendRequest.name) private friendModel: Model<FriendRequest>,
  ) { }

  async create(createPostDto: CreatePostDto, currentUser: IUserPayload) {
    const newPost = new this.postModel({
      ...createPostDto,
      author: currentUser,
    });

    const savedPost = await newPost.save();

    const post = await this.findOne(savedPost._id.toString());

    const responsePost = plainToInstance(ResponsePostDto, post, {
      excludeExtraneousValues: true,
    });

    this.postGateway.handlePostCreate(responsePost);

    return savedPost;
  }

  async uploadMedia(id: string, uploadMediaDtos: UploadMediaDto[]) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    uploadMediaDtos.forEach((mediaDto) => {
      post.mediaFiles.push(mediaDto);
    });

    const savedPost = await post.save();

    const responsePost = plainToInstance(ResponsePostDto, savedPost, {
      excludeExtraneousValues: true,
    });

    this.postGateway.handleUploadMedia(id, responsePost.mediaFiles);
  }

  async replaceMedia(id: string, uploadMediaDtos: UploadMediaDto[]) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    post.mediaFiles = [];
    await post.save();

    uploadMediaDtos.forEach((mediaDto) => {
      post.mediaFiles.push(mediaDto);
    });

    const savedPost = await post.save();

    const responsePost = plainToInstance(ResponsePostDto, savedPost, {
      excludeExtraneousValues: true,
    });

    this.postGateway.handleReplaceMedia(id, responsePost.mediaFiles);
  }

  async removeMedia(id: string, deleteMediaDto: DeleteMediaDto) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    post.mediaFiles = post.mediaFiles.filter(
      (mediaFile) => mediaFile.public_id !== deleteMediaDto.mediaId,
    );

    await post.save();

    this.postGateway.handleRemoveMedia(id, deleteMediaDto.mediaId);
  }

  async findAll(
    userId: string | null,
    currentUser: IUserPayload,
    limit: number,
    cursor?: string,
  ) {
    // ✅ Case 1: Viewing another user's profile
    if (userId) {
      const user = await this.userService.findOne(userId);
      if (!user) throw new NotFoundException('User not found');

      const query: Record<string, unknown> = {
        author: user._id,
        $or: [
          { privacy: 'public' },
          // visible to friends only if current user is in friend list
          { privacy: 'friends', 'author.friends': currentUser._id },
        ],
      };

      if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
      }

      const posts = await this.postModel
        .find(query)
        .populate('author')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const hasNextPage = posts.length > limit;
      const items = hasNextPage ? posts.slice(0, limit) : posts;

      const sentRequests1 = await this.friendModel
        .find({ sender: currentUser._id, status: 'pending' })
        .select('receiver')
        .lean();
      const sentRequestReceiverIds1 = new Set(
        sentRequests1.map(
          (req) => req.receiver?._id?.toString() || req.receiver?.toString(),
        ),
      );

      const postsWithReaction = await Promise.all(
        items.map(async (post) => {
          const myReaction = await this.reactionService.findExisting(
            post._id.toString(),
            currentUser._id,
          );
          return {
            ...post,
            myReaction: myReaction?.type || null,
            isFollowing: (user.friends || []).some(
              (f) => f._id.toString() === post.author._id.toString(),
            ),
            followRequested: sentRequestReceiverIds1.has(
              post.author._id.toString(),
            ),
          };
        }),
      );

      return {
        items: postsWithReaction,
        hasNextPage,
        cursor: hasNextPage ? items[items.length - 1].createdAt : null,
      };
    }

    // ✅ Case 2: Viewing own feed
    const user = await this.userService.findOne(currentUser._id);
    const friendsOfAuthorIds = user.friends.map((fr) => fr._id.toString());

    const query: Record<string, unknown> = {
      $or: [
        { privacy: 'public' },
        { privacy: 'friends', author: { $in: friendsOfAuthorIds } },
        { privacy: 'private', author: currentUser._id },
      ],
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await this.postModel
      .find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, limit) : posts;

    const sentRequests = await this.friendModel
      .find({ sender: currentUser._id, status: 'pending' })
      .select('receiver')
      .lean();
    const sentRequestReceiverIds = new Set(
      sentRequests.map(
        (req) => req.receiver?._id?.toString() || req.receiver?.toString(),
      ),
    );

    const postsWithReaction = await Promise.all(
      items.map(async (post) => {
        const myReaction = await this.reactionService.findExisting(
          post._id.toString(),
          currentUser._id,
        );
        return {
          ...post,
          myReaction: myReaction?.type || null,
          isFollowing: friendsOfAuthorIds.includes(post.author._id.toString()),
          followRequested: sentRequestReceiverIds.has(
            post.author._id.toString(),
          ),
        };
      }),
    );

    return {
      items: postsWithReaction,
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate('author');
    if (!post) throw new NotFoundException('Post not found');

    return post;
  }

  findOneWithReaction(id: string) {
    return this.reactionService.findPostReaction(id);
  }

  async findOneWithMyReaction(id: string, currentUser: IUserPayload) {
    const post = await this.postModel
      .findById(id)
      .populate('author', '_id name email avatar')
      .lean();

    if (!post) throw new NotFoundException('Post not found');

    const myReaction = await this.reactionService.findExisting(
      post._id.toString(),
      currentUser._id,
    );
    return {
      ...post,
      myReaction: myReaction?.type || null,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.postGateway.handlePostUpdate({
      postId: id,
      backgroundColor: post.backgroundColor,
      content: post.content,
      privacy: post.privacy,
    });

    return post;
  }

  async remove(id: string) {
    const post = await this.postModel.findByIdAndDelete(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.postGateway.handleRemovePost(id);
  }

  // async addReaction(addReactionDto: AddReactionDto, currentUser: IUserPayload) {
  //   const { postId, type } = addReactionDto;
  //   const post = await this.findOne(postId);

  //   const existingReaction = await this.reactionService.findExisting(
  //     postId,
  //     currentUser._id,
  //   );

  //   let oldReactionType: IReactionType | null = null;

  //   if (existingReaction) {
  //     // NOT DO ANYTHING IF new reaction === existingReaction
  //     if (type === existingReaction.type) return;
  //     // Update with the new reaction
  //     oldReactionType = existingReaction.type;
  //     await this.reactionService.update(existingReaction._id.toString(), type);
  //   } else {
  //     // Create the reaction for post
  //     await this.reactionService.create(addReactionDto, currentUser);
  //   }

  //   // *** UPDATE REACTION COUNTS
  //   const reactionCounts = post.reactionsCount;
  //   // decrease count
  //   if (oldReactionType) {
  //     const value = reactionCounts.get(oldReactionType) || 0;
  //     reactionCounts.set(oldReactionType, value - 1 >= 0 ? value - 1 : 0);
  //   }
  //   // increase count
  //   const value = reactionCounts.get(type) || 0;
  //   reactionCounts.set(type, value + 1);

  //   post.reactionsCount = reactionCounts;
  //   const savedPost = await post.save();

  //   const responsePost = plainToInstance(ResponsePostDto, savedPost, {
  //     excludeExtraneousValues: true,
  //   });

  //   this.postGateway.handleAddReaction(responsePost);

  //   // const notificationContent = `${currentUser.name} has react ${type} to your post`;

  //   // await this.notificationService.create(
  //   //   currentUser._id,
  //   //   post.author._id.toString(),
  //   //   'reaction',
  //   //   notificationContent,
  //   //   post._id.toString(),
  //   // );
  // }

  async addReaction(addReactionDto: AddReactionDto, currentUser: IUserPayload) {
    const { postId, type } = addReactionDto;

    // Check if the user has already reacted to the post
    const existingReaction = await this.reactionService.findExisting(
      postId,
      currentUser._id,
    );

    // If the reaction already exists and is the same type, do nothing
    if (existingReaction && existingReaction.type === type) {
      return;
    }

    // Prepare the increment/decrement operations for reactionsCount
    const updateOps: Record<string, number> = {
      [`reactionsCount.${type}`]: 1, // Increase count for the new reaction type
    };

    if (existingReaction) {
      // If a different reaction already exists, update it to the new one
      await this.reactionService.update(existingReaction._id.toString(), type);

      // Decrease the count of the old reaction type
      updateOps[`reactionsCount.${existingReaction.type}`] = -1;
    } else {
      // If no existing reaction, create a new one
      await this.reactionService.create(addReactionDto, currentUser);
    }

    // Atomically update the reaction counts using $inc
    await this.postModel.updateOne({ _id: postId }, { $inc: updateOps });

    // Fetch the updated post (in case you want to emit real-time updates)
    const updatedPost = await this.findOne(postId);

    const reactions = await this.findOneWithReaction(
      updatedPost._id.toString(),
    );

    // Transform the updated post to a response DTO
    const responsePost = plainToInstance(ResponsePostDto, updatedPost, {
      excludeExtraneousValues: true,
    });

    const responseReactions = plainToInstance(
      ResponsePostReactionDto,
      reactions,
      {
        excludeExtraneousValues: true,
      },
    );

    this.postGateway.handleAddReaction(
      {
        ...responsePost,
        myReaction: addReactionDto.type,
      },
      responseReactions,
    );

    // Trigger Notification for the Post Author
    if (updatedPost.author._id.toString() !== currentUser._id) {
      await this.notificationService.create(
        currentUser._id,
        updatedPost.author._id.toString(),
        'reaction',
        `reacted ${type} to your post`,
        updatedPost._id.toString(),
      );
    }
  }

  async removeReaction(
    removeReactionDto: RemoveReactionDto,
    currentUser: IUserPayload,
  ) {
    const { postId } = removeReactionDto;

    // Atomically find and delete the reaction (returns null if not found)
    const deletedReaction = await this.reactionService.delete(
      postId,
      currentUser._id,
    );

    // If no reaction was found/deleted, exit early
    if (!deletedReaction) return;

    // Decrement the reaction count atomically
    const savedPost = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $inc: { [`reactionsCount.${deletedReaction.type}`]: -1 },
      },
      { new: true },
    );

    const reactions = await this.findOneWithReaction(postId);

    const responsePostDto = plainToInstance(ResponsePostDto, savedPost, {
      excludeExtraneousValues: true,
    });

    const responseReactions = plainToInstance(
      ResponsePostReactionDto,
      reactions,
      {
        excludeExtraneousValues: true,
      },
    );

    this.postGateway.handleRemoveReaction(responsePostDto, responseReactions);
  }
  async findPostsByUser(
    userId: string,
    currentUser: IUserPayload,
    limit: number,
    cursor?: string,
  ) {
    const author = await this.userService.findOne(userId);
    if (!author) throw new NotFoundException('User not found');

    // --- Determine friendship & friend request status ---
    const currentUserData = await this.userService.findOne(currentUser._id);

    const isFriend = (currentUserData.friends || []).some(
      (fr) => fr._id.toString() === userId,
    );

    const sentRequest = await this.friendModel.findOne({
      sender: currentUser._id,
      receiver: userId,
      status: 'pending',
    });

    const isSentFriendRequest = !!sentRequest;

    // --- Post fetching logic ---
    const query: Record<string, any> = { author: new Types.ObjectId(userId) };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await this.postModel
      .find(query)
      .populate('author')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, limit) : posts;

    // --- Attach reactions for the current user ---
    const postsWithReaction = await Promise.all(
      items.map(async (post) => {
        const myReaction = await this.reactionService.findExisting(
          post._id.toString(),
          currentUser._id,
        );
        return { ...post, myReaction: myReaction?.type || null };
      }),
    );

    // --- Return author with relationship info ---
    // --- Return author with relationship info ---
    const authorWithRelation = {
      ...(author.toObject?.() || author),
      friendsCount: (author.friends || []).length,
      isFriend,
      isSentFriendRequest,
    };

    return {
      items: {
        posts: postsWithReaction,
        author: authorWithRelation,
      },
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }
}

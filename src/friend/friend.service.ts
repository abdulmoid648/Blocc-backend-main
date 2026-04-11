import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { FriendRequest } from './schemas/friend-request.schemas';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { FriendGateway } from './friend.gateway';
import { transformDto } from 'src/_cores/utils/transform-dto.utils';
import { ResponseFriendRequestDto } from './dto/response-request-friend.dto';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequest>,
    private userService: UserService,
    private friendGateway: FriendGateway,
  ) {}

  async create(@CurrentUser() currentUser: IUserPayload, receiverId: string) {
    // receiver user exist
    const receiver = await this.userService.findOne(receiverId);
    // Prevent send a request to yourself
    if (currentUser._id === receiver._id.toString())
      throw new BadRequestException('Cannot send a friend request to yourself');

    // Prevent duplicate the same friend
    // const existingFriendRequest = await this.friendRequestModel.findOne({
    //   sender: currentUser._id,
    //   receiver: receiver._id,
    //   status: { $in: ['pending', 'accept'] },
    // });

    const existingFriendRequest = await this.friendRequestModel.findOne({
      $or: [
        {
          sender: currentUser._id,
          receiver: receiver._id,
          status: { $in: ['pending', 'accept'] },
        },
        {
          sender: receiver._id,
          receiver: currentUser._id,
          status: { $in: ['pending', 'accept'] },
        },
      ],
    });

    if (existingFriendRequest)
      throw new BadRequestException(
        'This user already sent request to you, please accept that',
      );

    const friendRequest = new this.friendRequestModel({
      sender: currentUser._id,
      receiver: receiver._id,
      status: 'pending',
    });

    const savedFriendRequest = await friendRequest.save();

    const populatedFriendRequest = await this.findOne(
      savedFriendRequest._id.toString(),
    );

    const responseFriendRequestDto = transformDto(
      ResponseFriendRequestDto,
      populatedFriendRequest,
    );

    this.friendGateway.handleSendFriendRequest(
      receiverId,
      responseFriendRequestDto,
    );
  }

  async unFriend(@CurrentUser() currentUser: IUserPayload, friendId: string) {
    const friend = await this.userService.findOne(friendId);

    if (!friend) {
      throw new NotFoundException('User not found');
    }

    if (currentUser._id === friend._id.toString()) {
      throw new BadRequestException('You cannot unfriend yourself');
    }

    const isFriend = await this.userService.checkIsFriend(
      currentUser._id,
      friend._id.toString(),
    );

    if (!isFriend) {
      throw new BadRequestException('You are not friends');
    }

    // Remove Friend both side
    await this.userService.removeFriend(currentUser._id, friend._id.toString());
    await this.userService.removeFriend(friend._id.toString(), currentUser._id);

    // Remove FriendRequest (accept) both side
    await this.friendRequestModel.deleteOne({
      $or: [
        { sender: currentUser._id, receiver: friend._id, status: 'accept' },
        { sender: friend._id, receiver: currentUser._id, status: 'accept' },
      ],
    });

    this.friendGateway.handleUnfriend(
      friend._id.toString(),
      currentUser._id.toString(),
    );
  }

  async acceptFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    friendRequestId: string,
  ) {
    const friendRequest = await this.friendRequestModel
      .findById(friendRequestId)
      .populate('sender', 'name avatar');

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendRequest.status !== 'pending') {
      throw new BadRequestException('Request already handled');
    }

    if (currentUser._id !== friendRequest.receiver._id.toString()) {
      throw new ForbiddenException();
    }

    friendRequest.status = 'accept';
    await friendRequest.save();

    await this.userService.addFriend(
      friendRequest.sender._id.toString(),
      friendRequest.receiver._id.toString(),
    );

    await this.userService.addFriend(
      friendRequest.receiver._id.toString(),
      friendRequest.sender._id.toString(),
    );

    // FE: filter out the _id => friendsPending
    // FE: push { } to => myFriends

    // Sender: John -> send request Receiver: Thomas
    // Logged: Thomas -> accept

    const responseFriendRequestDto = transformDto(
      ResponseFriendRequestDto,
      friendRequest,
    );

    // this.friendGateway.handleAcceptRequest({
    //   friendRequestId,
    //   _id: friendRequest.sender._id.toString(),
    //   name: friendRequest.sender.name,
    //   avatarUrl: responseFriendRequestDto.senderAvatarUrl,
    // });

    this.friendGateway.handleAcceptRequest(
      friendRequest.sender._id.toString(),
      responseFriendRequestDto,
      currentUser._id,
    );
  }

  async rejectFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    friendRequestId: string,
  ) {
    const friendRequest =
      await this.friendRequestModel.findById(friendRequestId);

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendRequest.status !== 'pending') {
      throw new BadRequestException('Request already handled');
    }

    if (currentUser._id !== friendRequest.receiver._id.toString()) {
      throw new ForbiddenException();
    }

    friendRequest.status = 'reject';
    await friendRequest.save();

    this.friendGateway.handleRejectRequest(
      friendRequest.sender._id.toString(),
      friendRequestId,
      currentUser._id,
    );
  }

  async findOne(id: string) {
    const friend = await this.friendRequestModel
      .findById(id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    if (!friend) throw new NotFoundException('Friend request not found');

    return friend;
  }

  getCurrentRequestPending(currentUser: IUserPayload) {
    return this.friendRequestModel
      .find({
        receiver: currentUser._id,
        status: 'pending',
      })
      .populate('sender', 'name email avatar coverPhoto')
      .populate('receiver', 'name email avatar coverPhoto');
  }

  getCurrentFriends(currentUser: IUserPayload) {
    return this.userService.getFriends(currentUser._id);
  }

  async remove(@CurrentUser() currentUser: IUserPayload, receiverId: string) {
    const receiver = await this.userService.findOne(receiverId);

    const friendRequest = await this.friendRequestModel.findOne({
      sender: currentUser._id,
      receiver: receiver._id,
      status: 'pending',
    });

    if (!friendRequest)
      throw new NotFoundException('Friend request does not exist');

    await friendRequest.deleteOne();

    this.friendGateway.handleCancelRequest(
      receiverId,
      friendRequest.sender._id.toString(),
      friendRequest._id.toString(),
    );
  }
}

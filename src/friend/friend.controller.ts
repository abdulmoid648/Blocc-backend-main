import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';
import { AuthGuard } from 'src/_cores/guards/auth.guard';
import { ParseObjectIdPipe } from 'src/_cores/pipes/parse-object-id.pipe';
import { FriendService } from './friend.service';
import { TransformDTO } from 'src/_cores/interceptors/transform-dto.interceptor';
import { ResponseFriendRequestDto } from './dto/response-request-friend.dto';
import { ResponseFriendDto } from './dto/response-friend.dto';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @HttpCode(200)
  @Post('/request/:receiverId')
  @TransformDTO(ResponseFriendRequestDto)
  sendFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    @Param('receiverId', ParseObjectIdPipe) receiverId: string,
  ) {
    return this.friendService.create(currentUser, receiverId);
  }

  @Delete('/:friendId')
  @TransformDTO(ResponseFriendRequestDto)
  unFriend(
    @CurrentUser() currentUser: IUserPayload,
    @Param('friendId', ParseObjectIdPipe) friendId: string,
  ) {
    return this.friendService.unFriend(currentUser, friendId);
  }

  @HttpCode(200)
  @Post('/cancel-request/:receiverId')
  cancelFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    @Param('receiverId', ParseObjectIdPipe) receiverId: string,
  ) {
    return this.friendService.remove(currentUser, receiverId);
  }

  @HttpCode(200)
  @Post('/accept-request/:friendRequestId')
  acceptFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    @Param('friendRequestId', ParseObjectIdPipe) friendRequestId: string,
  ) {
    return this.friendService.acceptFriendRequest(currentUser, friendRequestId);
  }

  @HttpCode(200)
  @Post('/reject-request/:friendRequestId')
  rejectFriendRequest(
    @CurrentUser() currentUser: IUserPayload,
    @Param('friendRequestId', ParseObjectIdPipe) friendRequestId: string,
  ) {
    return this.friendService.rejectFriendRequest(currentUser, friendRequestId);
  }

  @Get()
  @TransformDTO(ResponseFriendDto)
  getCurrentFriends(@CurrentUser() currentUser: IUserPayload) {
    return this.friendService.getCurrentFriends(currentUser);
  }

  @Get('/request-pending')
  @TransformDTO(ResponseFriendRequestDto)
  getCurrentRequestPending(@CurrentUser() currentUser: IUserPayload) {
    return this.friendService.getCurrentRequestPending(currentUser);
  }
}

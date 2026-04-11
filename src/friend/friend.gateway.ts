import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResponseFriendRequestDto } from './dto/response-request-friend.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class FriendGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(userId);
  }

  handleSendFriendRequest(receiverId: string, data: ResponseFriendRequestDto) {
    this.server.to(receiverId).emit('send_friend_request', data);
  }

  handleUnfriend(targetUserId: string, unfriendedById: string) {
    this.server.to(targetUserId).emit('un_friend', unfriendedById);
  }

  handleAcceptRequest(
    senderId: string,
    data: ResponseFriendRequestDto,
    whoEmitEventId: string,
  ) {
    this.server
      .to(senderId)
      .emit('accept_friend_request', data, whoEmitEventId);
  }

  handleRejectRequest(
    senderId: string,
    friendRequestId: string,
    whoEmitEventId: string,
  ) {
    this.server
      .to(senderId)
      .emit('reject_friend_request', friendRequestId, whoEmitEventId);
  }

  handleCancelRequest(
    receiverId: string,
    senderId: string,
    friendRequestId: string,
  ) {
    this.server
      .to(receiverId)
      .emit('cancel_friend_request', { senderId, friendRequestId });
  }
}

// John | id: 1 => join 1
// Thomas | id: 2 => join 2

// socket.on('connect', () => {
//   const currentUserId = localStorage;
//   socket.emit('join_room', currentUserId);
// });

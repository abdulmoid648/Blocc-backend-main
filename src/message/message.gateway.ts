import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResponseMessageDto } from './dto/response-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server; // === io

  // === io.on('connection')
  handleConnection(client: Socket) {
    console.log(`Client connect ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnect ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoinConversation(
    @MessageBody() conversationId: string, // FE
    @ConnectedSocket() client: Socket, // === socket
  ) {
    console.log('join room', conversationId);
    await client.join(conversationId);
  }

  handleNewMessage(conversationId: string, data: ResponseMessageDto) {
    this.server.to(conversationId).emit('new_message', data);
  }

  handleUpdateMessage(conversationId: string, data: ResponseMessageDto) {
    this.server.to(conversationId).emit('update_message', data);
  }

  handleUpdateMessageV2(data: any) {
    console.log('check data from socket', data);

    this.server.to(data.conversationId).emit('update_message', data);
  }

  handleRemoveMessage(conversationId: string, messageId: string) {
    this.server.to(conversationId).emit('remove_message', messageId);
  }

  handleSeenMessage(
    conversationId: string,
    messageId: string,
    seenBy: { seenById: string; seenByName: string; seenByAvatarUrl: string },
  ) {
    console.log('check seenBy', seenBy);
    this.server.to(conversationId).emit('seen_message', { messageId, seenBy });
  }
}

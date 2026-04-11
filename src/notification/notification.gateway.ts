import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ResponseNotificationDto } from './dto/response-notification.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  handleNotificationCreate(receiverId: string, data: ResponseNotificationDto) {
    this.server.to(receiverId).emit('notification_created', data);
  }
}

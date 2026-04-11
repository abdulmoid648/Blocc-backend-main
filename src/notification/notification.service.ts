import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { transformDto } from 'src/_cores/utils/transform-dto.utils';
import { ResponseNotificationDto } from './dto/response-notification.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private notificationGateway: NotificationGateway,
  ) {}

  async create(
    senderId: string,
    receiverId: string,
    type: INotificationType,
    content: string,
    linkToId?: string,
  ) {
    const notification = new this.notificationModel({
      sender: senderId,
      receiver: receiverId,
      type,
      content,
      linkToId,
    });

    const savedNotification = await notification.save();
    const populatedNotification = await this.findOne(
      savedNotification._id.toString(),
    );
    const responseNotificationDto = transformDto(
      ResponseNotificationDto,
      populatedNotification,
    );

    this.notificationGateway.handleNotificationCreate(
      receiverId,
      responseNotificationDto,
    );
  }

  async findAll(currentUser: IUserPayload, limit: number, cursor: string) {
    const query: Record<string, any> = { receiver: currentUser._id };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const notifications = await this.notificationModel
      .find(query)
      .limit(limit + 1)
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar');

    const hasNextPage = notifications.length > limit;
    const items = hasNextPage ? notifications.slice(0, -1) : notifications;

    return {
      items,
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }

  async findOne(id: string) {
    const notification = await this.notificationModel
      .findById(id)
      .populate('sender', 'name avatar');

    if (!notification) throw new NotFoundException('Notification not found');

    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.findOne(id);
    notification.isRead = true;
    await notification.save();
  }

  async markAllRead(currentUser: IUserPayload) {
    await this.notificationModel.updateMany(
      { receiver: currentUser._id, isRead: false },
      {
        isRead: true,
      },
    );
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { MessageGateway } from './message.gateway';
import { plainToInstance } from 'class-transformer';
import { ResponseMessageDto } from './dto/response-message.dto';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<Message>,
    private conversationService: ConversationService,
    private userService: UserService,
    private messageGateway: MessageGateway,
  ) {}

  async getAllMessages(conversationId: string, limit: number, cursor: string) {
    const query: Record<string, any> = {
      conversation: conversationId,
    };

    if (cursor) {
      // query.createdAt = { $gt: new Date(cursor) };
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      // .sort({ createdAt: 1 }) // old -> new -> top -> bottom
      .sort({ createdAt: -1 }) // new → old
      .limit(limit + 1)
      .populate('sender', 'name avatar')
      .populate('seenBy', 'name avatar');

    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, limit) : messages;

    return {
      items,
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }

  async getAllMessagesV2(
    conversationId: string,
    limit: number,
    cursor: string,
  ) {
    const query: Record<string, any> = {
      conversation: conversationId,
    };

    if (cursor) {
      // query.createdAt = { $gt: new Date(cursor) };
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      // .sort({ createdAt: 1 })
      .sort({ createdAt: -1 }) // new → old
      .limit(limit + 1)
      .populate('sender', 'name avatar')
      .populate('seenBy', 'name avatar');

    const hasNextPage = messages.length > limit;
    const items = hasNextPage ? messages.slice(0, limit) : messages;

    return {
      items,
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }

  async findOne(id: string) {
    const message = await this.messageModel.findOne({
      _id: id,
      isDelete: false,
    });
    if (!message) throw new NotFoundException('Message not found');

    return message;
  }

  async sendMessage(
    conversationId: string,
    sendMessageDto: SendMessageDto,
    currentUser: IUserPayload,
  ) {
    const { text, mediaFiles } = sendMessageDto;

    const message = new this.messageModel({
      conversation: conversationId,
      sender: currentUser._id,
      text,
      mediaFiles,
      seenBy: [currentUser._id],
    });

    const savedMessage = await message.save();

    // Update last message in conversation
    await this.conversationService.updateLastMessage(
      conversationId,
      savedMessage._id.toString(),
    );

    await this.conversationService.updateLastMessageAt(
      conversationId,
      savedMessage,
    );

    const newMessage = await this.messageModel
      .findById(savedMessage._id)
      .populate('sender', 'name avatar')
      .populate('seenBy', 'name avatar');

    // convert savedMessage into ResponseMessageDto
    const responseMessage = plainToInstance(ResponseMessageDto, newMessage, {
      excludeExtraneousValues: true,
    });

    // TODO: Real time
    this.messageGateway.handleNewMessage(conversationId, responseMessage);
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    currentUser: IUserPayload,
  ) {
    const { text, mediaFiles } = updateMessageDto;

    const message = await this.findOne(id);

    if (message.sender._id.toString() !== currentUser._id) {
      throw new ForbiddenException();
    }

    message.text = text || message.text;
    message.mediaFiles = mediaFiles || message.mediaFiles;

    await message.save();

    // this.messageGateway.handleUpdateMessageV2({
    //   _id: message._id,
    //   conversationId: message.conversation._id,
    //   text: message.text,
    //   mediaFiles: message.mediaFiles,
    // });

    const newMessage = await this.messageModel
      .findById(message._id)
      .populate('sender', 'name avatar')
      .populate('seenBy', 'name avatar');

    // convert savedMessage into ResponseMessageDto
    const responseMessage = plainToInstance(ResponseMessageDto, newMessage, {
      excludeExtraneousValues: true,
    });

    // TODO: Real time
    this.messageGateway.handleUpdateMessage(
      message.conversation._id.toString(),
      responseMessage,
    );
  }

  async remove(id: string, currentUser: IUserPayload) {
    const message = await this.findOne(id);

    if (message.sender._id.toString() !== currentUser._id) {
      throw new ForbiddenException();
    }

    message.isDelete = true;
    await message.save();

    this.messageGateway.handleRemoveMessage(
      message.conversation._id.toString(),
      message._id.toString(),
    );
  }

  // async markSeenMessage(id: string, currentUser: IUserPayload) {
  //   const message = await this.findOne(id);

  //   const alreadySeen = message.seenBy.some(
  //     (u) => u._id.toString() === currentUser._id,
  //   );

  //   if (!alreadySeen) {
  //     const user = await this.userService.findOne(currentUser._id);
  //     message.seenBy.push(user);
  //     await message.save();

  //     const responseUserDto = plainToInstance(ResponseUserDto, user, {
  //       excludeExtraneousValues: true,
  //     });

  //     this.messageGateway.handleSeenMessage(
  //       message.conversation._id.toString(),
  //       message._id.toString(),
  //       {
  //         seenById: responseUserDto._id,
  //         seenByName: responseUserDto.name,
  //         seenByAvatarUrl: responseUserDto.avatarUrl,
  //       },
  //     );
  //   }
  // }

  async markSeenMessage(id: string, currentUser: IUserPayload) {
    const userId = currentUser._id;

    // Update the message by adding the user to `seenBy` if not already present
    const message = await this.messageModel
      .findOneAndUpdate(
        { _id: id },
        { $addToSet: { seenBy: userId } }, // ensures no duplicates
        { new: true }, // return the updated document
      )
      .populate('seenBy') // optional: if you need to inspect or return seenBy
      .populate('conversation');

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if the user was just added to seenBy
    const wasJustAdded = message.seenBy.some(
      (user: any) => user._id.toString() === userId.toString(),
    );

    // If user was already in seenBy before, skip further processing
    if (!wasJustAdded) return;

    // DTO
    const user = await this.userService.findOne(userId);

    const responseUserDto = plainToInstance(ResponseUserDto, user, {
      excludeExtraneousValues: true,
    });

    this.messageGateway.handleSeenMessage(
      message.conversation._id.toString(),
      message._id.toString(),
      {
        seenById: responseUserDto._id,
        seenByName: responseUserDto.name,
        seenByAvatarUrl: responseUserDto.avatarUrl,
      },
    );
  }
}

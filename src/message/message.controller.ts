import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ParseObjectIdPipe } from 'src/_cores/pipes/parse-object-id.pipe';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';
import { AuthGuard } from 'src/_cores/guards/auth.guard';
import { TransformDTO } from 'src/_cores/interceptors/transform-dto.interceptor';
import { ResponseMessageDto } from './dto/response-message.dto';

@Controller('messages')
@TransformDTO(ResponseMessageDto)
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/conversation/:conversationId')
  sendMessage(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.messageService.sendMessage(
      conversationId,
      sendMessageDto,
      currentUser,
    );
  }

  @Get('/conversation/:conversationId')
  findAllMessage(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return this.messageService.getAllMessages(conversationId, limit, cursor);
  }

  @Get('/v2/conversation/:conversationId')
  findAllMessageBottomToTop(
    @Param('conversationId', ParseObjectIdPipe) conversationId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return this.messageService.getAllMessagesV2(conversationId, limit, cursor);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.messageService.update(id, updateMessageDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.messageService.remove(id, currentUser);
  }

  @Patch(':id/seen')
  markSeenMessage(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.messageService.markSeenMessage(id, currentUser);
  }
}

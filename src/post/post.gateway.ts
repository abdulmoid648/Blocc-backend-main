import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server } from 'socket.io';
import { ResponsePostDto } from './dto/response-post.dto';
import { UploadMediaDto } from 'src/_cores/globals/dtos';
import { ResponsePostReactionDto } from './dto/response-post-reaction.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class PostGateway {
  @WebSocketServer()
  server: Server; // === io

  handlePostCreate(data: ResponsePostDto) {
    this.server.emit('post_created', data);
  }

  handleReplaceMedia(postId: string, uploadMediaDtos: UploadMediaDto[]) {
    this.server.emit('post_replace_media', {
      postId,
      mediaFiles: uploadMediaDtos,
    });
  }

  handleUploadMedia(postId: string, uploadMediaDtos: UploadMediaDto[]) {
    this.server.emit('post_upload_media', {
      postId,
      mediaFiles: uploadMediaDtos,
    });
  }

  handleRemoveMedia(postId: string, mediaId: string) {
    this.server.emit('post_remove_media', {
      postId,
      mediaId,
    });
  }

  handlePostUpdate(data: {
    postId: string;
    backgroundColor: string;
    content: string;
    privacy: IPrivacy;
  }) {
    this.server.emit('post_updated', data);
  }

  handleRemovePost(postId: string) {
    this.server.emit('post_deleted', postId);
  }

  handleAddReaction(
    post: ResponsePostDto,
    reactions: ResponsePostReactionDto[],
  ) {
    this.server.emit('post_add_reaction', post, reactions);
  }

  handleRemoveReaction(
    post: ResponsePostDto,
    reactions: ResponsePostReactionDto[],
  ) {
    this.server.emit('post_remove_reaction', post, reactions);
  }
}

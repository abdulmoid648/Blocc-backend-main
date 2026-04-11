import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddReactionDto } from 'src/post/dto/add-reaction.dto';
import { Reaction } from './schemas/reaction.schema';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<Reaction>,
  ) {}

  create(createReactionDto: AddReactionDto, currentUser: IUserPayload) {
    const reaction = new this.reactionModel({
      post: createReactionDto.postId,
      type: createReactionDto.type,
      user: currentUser._id,
    });

    return reaction.save();
  }

  findAll() {
    return `This action returns all reaction`;
  }

  findExisting(postId: string, userId: string) {
    return this.reactionModel.findOne({ post: postId, user: userId });
  }

  findOne(id: number) {
    return `This action returns a #${id} reaction`;
  }

  async update(id: string, type: IReactionType) {
    const reaction = await this.reactionModel.findByIdAndUpdate(
      id,
      { type },
      { new: true },
    );

    if (!reaction) throw new NotFoundException('Reaction not found');

    return reaction;
  }

  async remove(id: string) {
    const reaction = await this.reactionModel.findByIdAndDelete(id);
    if (!reaction) throw new NotFoundException('Reaction not found');
  }

  async delete(postId: string, userId: string) {
    const data = await this.reactionModel.findOneAndDelete({
      post: postId,
      user: userId,
    });

    return data;
  }

  async findPostReaction(postId: string) {
    return this.reactionModel
      .find({ post: postId })
      .populate('user', 'name avatar');
  }
}

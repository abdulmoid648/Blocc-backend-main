import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decodedUser = (await this.jwtService.verifyAsync(
        token,
      )) as IUserPayload;

      const user = {
        _id: decodedUser._id,
        name: decodedUser.name,
        email: decodedUser.email,
        role: decodedUser.role,
        isActive: decodedUser.isActive,
      } as IUserPayload;

      request.currentUser = user;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

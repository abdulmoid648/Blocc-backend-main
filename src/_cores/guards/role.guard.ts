import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Request } from 'express';
import { ResourceService } from 'src/resource/resource.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private resourceService: ResourceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const currentUser = request.currentUser;
    const resourceType = this.extractResource(request.path);

    if (!resourceType) {
      throw new BadRequestException(`ResourceType not found`);
    }

    const requiredRoles = this.reflector.get(
      ROLES_KEY,
      context.getHandler(),
    ) as IRole[];

    if (!requiredRoles) {
      return true;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    if (requiredRoles.includes('admin') && currentUser.role === 'admin') {
      return true;
    }

    if (requiredRoles.includes('user') && currentUser.role === 'user') {
      const userId = currentUser._id;
      const resourceId = request.params.id;

      const resourceIdOfUser = await this.resourceService.getResource(
        resourceType,
        resourceId,
      );

      if (userId === resourceIdOfUser) return true;
      throw new ForbiddenException('You can only access your own resources');
    }

    throw new ForbiddenException('You do not have enough permission');
  }

  private extractResource(path: string): string | null {
    const paths = path.split('/');

    if (paths.length > 3) {
      return paths[3];
    }

    return null;
  }
}

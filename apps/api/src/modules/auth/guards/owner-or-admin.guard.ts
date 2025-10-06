import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { CurrentUserData } from '@/common/decorators/current-user.decorator';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUserData = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const resourceOwnerParam = this.reflector.get<string>(
      'resourceOwnerParam',
      context.getHandler(),
    );

    const ownerParam = resourceOwnerParam || 'id';
    const resourceOwnerId = request.params[ownerParam];

    if (!resourceOwnerId) {
      throw new ForbiddenException(
        'Access denied. Admin role required or resource owner parameter missing.',
      );
    }

    if (user.id === resourceOwnerId) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. You can only access your own resources.',
    );
  }
}

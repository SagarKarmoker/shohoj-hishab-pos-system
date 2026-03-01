import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: UserRole } | undefined;

    if (!user?.role) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    throw new ForbiddenException('Only admin users can access this resource');
  }
}


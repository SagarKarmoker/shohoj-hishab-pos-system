import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Guard that allows access to SALES, ADMIN, and SUPER_ADMIN roles
 * Used for sales dashboard endpoints
 */
@Injectable()
export class SalesRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const allowedRoles = [UserRole.SALES, UserRole.ADMIN, UserRole.SUPER_ADMIN];
    
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied. Sales role required.');
    }

    return true;
  }
}

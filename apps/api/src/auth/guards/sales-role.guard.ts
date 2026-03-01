import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class SalesRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string } | undefined;

    if (!user?.role) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'SALES' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return true;
    }

    throw new ForbiddenException('Only sales or admin users can access this resource');
  }
}


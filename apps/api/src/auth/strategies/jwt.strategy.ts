import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  uid: string;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new ForbiddenException('Your account is pending approval. Please contact admin.');
    }

    // Check if subscription has expired (skip for admin/sales)
    const privilegedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SALES];
    const isPrivilegedRole = privilegedRoles.includes(user.role);
    if (!isPrivilegedRole && user.subscriptionEndDate) {
      const now = new Date();
      if (user.subscriptionEndDate < now) {
        throw new ForbiddenException('Your subscription has expired. Please contact admin to renew.');
      }
    }

    // Get sales person ID if user is a sales person
    let salesPersonId: string | undefined;
    if (user.role === UserRole.SALES) {
      const salesPerson = await this.prisma.salesPerson.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (salesPerson) {
        salesPersonId = salesPerson.id;
      }
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      phoneNumber: user.phoneNumber,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      salesPersonId,
    };
  }
}

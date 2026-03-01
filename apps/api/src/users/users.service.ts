import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    displayName?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { 
        emailVerificationToken: token,
        emailVerified: false,
      },
    });
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  /**
   * Find user by phone number (optional, for future use)
   */
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { phoneNumber },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users (admin only)
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count total users
   */
  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Count verified users
   */
  async countVerifiedUsers(): Promise<number> {
    return this.prisma.user.count({
      where: { emailVerified: true },
    });
  }
}

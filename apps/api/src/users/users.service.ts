import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find or create a user based on Firebase UID
   */
  async findOrCreateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    // Try to find existing user by Firebase UID
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      // Create new user with all provided data including password
      user = await this.prisma.user.create({
        data: {
          firebaseUid,
          phoneNumber: userData.phoneNumber || '',
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          password: userData.password, // Include password during creation
        },
      });
    } else {
      // Update existing user - only update fields that are provided
      const updateData: any = {};
      if (userData.phoneNumber) updateData.phoneNumber = userData.phoneNumber;
      if (userData.email) updateData.email = userData.email;
      if (userData.displayName) updateData.displayName = userData.displayName;
      if (userData.photoURL) updateData.photoURL = userData.photoURL;
      if (userData.password) updateData.password = userData.password;

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    return user;
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
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
   * Find user by phone number
   */
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { phoneNumber },
    });
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    firebaseUid: string;
    phoneNumber: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
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
}

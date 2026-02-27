import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { admin } from './firebase.config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export interface VerifyTokenResponse {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    displayName?: string;
    role: string;
  };
  needsApproval: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    displayName?: string;
    role: string;
  };
  needsApproval: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Verify Firebase ID token and return JWT for session (for OTP-based auth)
   */
  async verifyFirebaseToken(firebaseToken: string): Promise<VerifyTokenResponse> {
    try {
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      
      const firebaseUid = decodedToken.uid;
      const phoneNumber = decodedToken.phone_number || '';
      const email = decodedToken.email || undefined;
      const displayName = decodedToken.name || undefined;
      const photoURL = decodedToken.picture || undefined;

      // Find or create user in our database
      const user = await this.usersService.findOrCreateUser(firebaseUid, {
        phoneNumber,
        email,
        displayName,
        photoURL,
      });

      // Check if user account is active (not pending approval)
      if (!user.isActive) {
        throw new UnauthorizedException('Your account is pending approval. Please contact admin.');
      }

      // Generate JWT for our application
      const payload = {
        sub: user.id,
        uid: user.firebaseUid,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      return {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email || undefined,
          displayName: user.displayName || undefined,
          role: user.role,
        },
        needsApproval: !user.isActive,
        subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
        subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
      };
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  /**
   * Login with phone number and password
   */
  async loginWithPassword(phoneNumber: string, password: string): Promise<LoginResponse> {
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    // Find user by phone number
    const user = await this.usersService.findByPhoneNumber(formattedPhone);
    
    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please login with OTP first to set up your password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Check if user account is active (not pending approval)
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is pending approval. Please contact admin.');
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      uid: user.firebaseUid,
      phoneNumber: user.phoneNumber,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    // Check if user needs approval (isActive = false means pending approval)
    const needsApproval = !user.isActive;

    return {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        role: user.role,
      },
      needsApproval,
      subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
      subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
    };
  }

  /**
   * Signup: Verify OTP and set password
   */
  async signupWithPassword(firebaseToken: string, password: string): Promise<VerifyTokenResponse> {
    // Verify the Firebase token first
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    
    const firebaseUid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number || '';
    
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    // Check if password meets requirements
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find or create user in our database with password
    const user = await this.usersService.findOrCreateUser(firebaseUid, {
      phoneNumber,
      password: hashedPassword,
    });

    // Check if user account is active (not pending approval)
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is pending approval. Please contact admin.');
    }

    // Generate JWT for our application
    const payload = {
      sub: user.id,
      uid: user.firebaseUid,
      phoneNumber: user.phoneNumber,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        role: user.role,
      },
      needsApproval: !user.isActive,
      subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
      subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
    };
  }

  /**
   * Reset password: Verify OTP and set new password
   */
  async resetPassword(firebaseToken: string, newPassword: string): Promise<{ message: string }> {
    // Verify the Firebase token first
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    
    const phoneNumber = decodedToken.phone_number || '';
    
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    // Check if password meets requirements
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find user and update password
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update password
    await this.usersService.updateUser(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  /**
   * Check if user exists (for checking if user needs to signup or login)
   */
  async checkUserExists(phoneNumber: string): Promise<{ exists: boolean; hasPassword: boolean }> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const user = await this.usersService.findByPhoneNumber(formattedPhone);
    
    if (!user) {
      return { exists: false, hasPassword: false };
    }

    return {
      exists: true,
      hasPassword: !!user.password,
    };
  }

  /**
   * Validate JWT token and return user
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Format phone number to standard Bangladesh format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't start with +, add +88 (Bangladesh country code)
    if (!cleaned.startsWith('+')) {
      cleaned = '+88' + cleaned;
    }
    
    return cleaned;
  }
}

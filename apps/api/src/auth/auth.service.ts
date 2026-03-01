import { Injectable, UnauthorizedException, BadRequestException, ConflictException, ServiceUnavailableException, Inject, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserRole } from '@prisma/client';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    role: string;
    emailVerified: boolean;
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
    private emailService: EmailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Signup with email and password
   */
  async signup(email: string, password: string, displayName?: string): Promise<{ message: string }> {
    this.logger.info('Signup attempt started', { context: 'AuthService', email });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.logger.warn('Invalid email format during signup', { context: 'AuthService', email });
      throw new BadRequestException('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn('Signup attempt with existing email', { context: 'AuthService', email });
      throw new ConflictException('Email already registered');
    }

    // Validate password requirements
    if (!password || password.length < 8) {
      this.logger.warn('Weak password during signup', { context: 'AuthService', email });
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Check password complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      this.logger.warn('Password complexity requirement not met', { context: 'AuthService', email });
      throw new BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = this.emailService.generateToken();
    const verificationExpires = this.emailService.getVerificationExpiry();

    // Create user
    await this.usersService.createUser({
      email,
      password: hashedPassword,
      displayName,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken, displayName);
    } catch (err) {
      this.logger.error('Failed to send verification email', { context: 'AuthService', email, err });
      throw new ServiceUnavailableException('Could not send verification email. Please try again later or use Resend.');
    }

    this.logger.info('Signup successful, verification email sent', { context: 'AuthService', email });
    return { message: 'Signup successful. Please check your email to verify your account.' };
  }

  /**
   * Create a new USER account on behalf of someone else (Sales/Admin flow).
   * - Allowed roles: SALES, ADMIN, SUPER_ADMIN (enforced by SalesRoleGuard)
   * - Behaviour: same verification flow as signup, but password is generated and never returned.
   */
  async createUserBySales(
    dto: { email: string; displayName?: string; phoneNumber?: string },
    creator: { id: string; role: string },
  ): Promise<{ message: string }> {
    const { email, displayName, phoneNumber } = dto;
    this.logger.info('Create user by sales/admin attempt', { context: 'AuthService', email, creatorId: creator.id, creatorRole: creator.role });

    // Extra safety: ensure role is allowed even if guard is misconfigured
    const allowedRoles: UserRole[] = [UserRole.SALES, UserRole.ADMIN, UserRole.SUPER_ADMIN];
    if (!allowedRoles.includes(creator.role as UserRole)) {
      throw new ForbiddenException('Only sales or admin users can create users');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.logger.warn('Invalid email format during createUserBySales', { context: 'AuthService', email });
      throw new BadRequestException('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn('createUserBySales attempted with existing email', { context: 'AuthService', email });
      throw new ConflictException('Email already registered');
    }

    // Generate a strong temporary password (user will set real one after verification)
    const tempPassword = `Temp${Date.now().toString(36)}Aa1`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generate verification token
    const verificationToken = this.emailService.generateToken();
    const verificationExpires = this.emailService.getVerificationExpiry();

    // Create user as plain USER, linked to creator
    await this.usersService.createUser({
      email,
      password: hashedPassword,
      displayName,
      phoneNumber,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      role: UserRole.USER,
      createdById: creator.id,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken, displayName);
    } catch (err) {
      this.logger.error('Failed to send verification email (createUserBySales)', { context: 'AuthService', email, err });
      throw new ServiceUnavailableException('Could not send verification email. Please try again later.');
    }

    this.logger.info('createUserBySales successful, verification email sent', { context: 'AuthService', email });
    return { message: 'User created. Please ask them to check their email to verify the account.' };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<LoginResponse> {
    this.logger.info('Email verification attempt', { context: 'AuthService' });

    if (!token) {
      this.logger.warn('Email verification attempted without token', { context: 'AuthService' });
      throw new BadRequestException('Verification token is required');
    }

    // Find user by verification token
    const user = await this.usersService.findByEmailVerificationToken(token);
    
    if (!user) {
      this.logger.warn('Invalid or expired verification token used', { context: 'AuthService' });
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token has expired
    if (this.emailService.isTokenExpired(user.emailVerificationExpires!)) {
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    // Update user as verified
    const updatedUser = await this.usersService.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    // Send welcome email (non-blocking; log failure)
    this.emailService.sendWelcomeEmail(updatedUser.email, updatedUser.displayName || undefined).catch((err) => {
      this.logger.warn('Failed to send welcome email', { context: 'AuthService', email: updatedUser.email, err });
    });

    // Generate JWT token
    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      token: jwtToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName || undefined,
        role: updatedUser.role,
        emailVerified: true,
      },
      needsApproval: !updatedUser.isActive,
      subscriptionStartDate: updatedUser.subscriptionStartDate?.toISOString(),
      subscriptionEndDate: updatedUser.subscriptionEndDate?.toISOString(),
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    this.logger.info('Login attempt started', { context: 'AuthService', email });

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      this.logger.warn('Login failed: user not found', { context: 'AuthService', email });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      this.logger.warn('Login failed: invalid password', { context: 'AuthService', email });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      this.logger.warn('Login failed: email not verified', { context: 'AuthService', email });
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Check if user account is active
    if (!user.isActive) {
      this.logger.warn('Login failed: account pending approval', { context: 'AuthService', email });
      throw new UnauthorizedException('Your account is pending approval. Please contact admin.');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    this.logger.info('Login successful', { context: 'AuthService', email, userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || undefined,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      needsApproval: !user.isActive,
      subscriptionStartDate: user.subscriptionStartDate?.toISOString(),
      subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate password reset token
    const resetToken = this.emailService.generateToken();
    const resetExpires = this.emailService.getPasswordResetExpiry();

    // Update user with reset token
    await this.usersService.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      this.logger.error('Failed to send password reset email', { context: 'AuthService', email: user.email, err });
      throw new ServiceUnavailableException('Could not send password reset email. Please try again later.');
    }

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    // Find user by reset token
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (this.emailService.isTokenExpired(user.passwordResetExpires!)) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password reset successfully. You can now login with your new password.' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = this.emailService.generateToken();
    const verificationExpires = this.emailService.getVerificationExpiry();

    // Update user with new token
    await this.usersService.updateUser(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken, user.displayName || undefined);
    } catch (err) {
      this.logger.error('Failed to resend verification email', { context: 'AuthService', email: user.email, err });
      throw new ServiceUnavailableException('Could not send verification email. Please try again later.');
    }

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  /**
   * Check if user exists
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; emailVerified: boolean }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return { exists: false, emailVerified: false };
    }

    return {
      exists: true,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

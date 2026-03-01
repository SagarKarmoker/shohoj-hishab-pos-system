import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  /**
   * Generate a secure random token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, token: string, displayName?: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const verificationLink = `${frontendUrl}?page=verify-email&token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email - সহজ হিসাব',
      template: './verification',
      context: {
        displayName: displayName || 'User',
        verificationLink,
        email,
      },
    });
  }

  /**
   * Send password reset link
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const resetLink = `${frontendUrl}?page=reset-password&token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password - সহজ হিসাব',
      template: './password-reset',
      context: {
        resetLink,
        email,
      },
    });
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, displayName?: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Shohoj Hishab - সহজ হিসাবে স্বাগতম',
      template: './welcome',
      context: {
        displayName: displayName || 'User',
        email,
      },
    });
  }

  /**
   * Calculate token expiry time
   */
  getVerificationExpiry(): Date {
    const expiryMs = parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '86400000'); // 24 hours
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Calculate password reset expiry time
   */
  getPasswordResetExpiry(): Date {
    const expiryMs = parseInt(process.env.PASSWORD_RESET_EXPIRES || '3600000'); // 1 hour
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Check if token has expired
   */
  isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}

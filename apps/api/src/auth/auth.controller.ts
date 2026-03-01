import { Controller, Post, Body, UseGuards, Get, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SalesRoleGuard } from './guards/sales-role.guard';

class SignupDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'Password (min 8 chars, uppercase, lowercase, number)', example: 'SecurePass123' })
  password!: string;

  @ApiProperty({ description: 'Display name', example: 'John Doe', required: false })
  displayName?: string;
}

class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ description: 'User password', example: 'SecurePass123' })
  password!: string;
}

class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address to send reset link', example: 'user@example.com' })
  email!: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  token!: string;

  @ApiProperty({ description: 'New password', example: 'NewSecurePass123' })
  newPassword!: string;
}

class ResendVerificationDto {
  @ApiProperty({ description: 'Email address to resend verification', example: 'user@example.com' })
  email!: string;
}

class CheckUserDto {
  @ApiProperty({ description: 'Email to check', example: 'user@example.com' })
  email!: string;
}

class CreateUserBySalesDto {
  @ApiProperty({ description: 'New user email', example: 'shop-owner@example.com' })
  email!: string;

  @ApiProperty({ description: 'Display name', required: false, example: 'Shop Owner' })
  displayName?: string;

  @ApiProperty({ description: 'Phone number', required: false, example: '+8801XXXXXXXXX' })
  phoneNumber?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ 
    summary: 'Sign up new user',
    description: 'Create a new user account with email and password. Sends verification email.' 
  })
  @ApiResponse({ status: 201, description: 'Signup successful, verification email sent' })
  @ApiResponse({ status: 400, description: 'Invalid input or password requirements not met' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto.email, dto.password, dto.displayName);
  }

  @Get('verify-email')
  @ApiOperation({ 
    summary: 'Verify email with token',
    description: 'Verify user email address using token from email link' 
  })
  @ApiQuery({ name: 'token', description: 'Email verification token', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully, JWT token returned' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login with email and password',
    description: 'Authenticate user and return JWT token' 
  })
  @ApiResponse({ status: 200, description: 'Login successful, JWT token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset link to email' 
  })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Reset user password using token from reset email' 
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPasswordWithToken(dto.token, dto.newPassword);
  }

  @Post('resend-verification')
  @ApiOperation({ 
    summary: 'Resend verification email',
    description: 'Resend email verification link' 
  })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Email not found or already verified' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('check-user')
  @ApiOperation({ 
    summary: 'Check if user exists',
    description: 'Check if email is registered and verified' 
  })
  @ApiResponse({ status: 200, description: 'User status returned' })
  async checkUser(@Body() dto: CheckUserDto) {
    return this.authService.checkUserExists(dto.email);
  }

  @UseGuards(AuthGuard('jwt'), SalesRoleGuard)
  @Post('sales/create-user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create user as sales/admin',
    description: 'SALES, ADMIN or SUPER_ADMIN can onboard a new USER and send verification email.',
  })
  @ApiResponse({ status: 201, description: 'User created, verification email sent.' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 403, description: 'Forbidden - only sales/admin can access' })
  async createUserBySales(@Body() dto: CreateUserBySalesDto, @Request() req: any) {
    return this.authService.createUserBySales(dto, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current user profile (requires JWT authentication)' 
  })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getProfile(@Request() req: any) {
    return {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      role: req.user.role,
    };
  }
}

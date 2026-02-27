import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class VerifyTokenDto {
  @ApiProperty({ description: 'Firebase authentication token from OTP verification' })
  firebaseToken!: string;
}

class LoginDto {
  @ApiProperty({ description: 'User phone number', example: '+8801712345678' })
  phoneNumber!: string;

  @ApiProperty({ description: 'User password', example: 'SecurePass123' })
  password!: string;
}

class SignupDto {
  @ApiProperty({ description: 'Firebase authentication token from OTP verification' })
  firebaseToken!: string;

  @ApiProperty({ description: 'Password to set for the account', example: 'SecurePass123' })
  password!: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: 'Firebase authentication token from OTP verification' })
  firebaseToken!: string;

  @ApiProperty({ description: 'New password to set', example: 'NewSecurePass123' })
  newPassword!: string;
}

class CheckUserDto {
  @ApiProperty({ description: 'Phone number to check', example: '+8801712345678' })
  phoneNumber!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify-token')
  @ApiOperation({ 
    summary: 'Verify Firebase token',
    description: 'Verify Firebase token and return JWT session token (for OTP-based login)' 
  })
  @ApiResponse({ status: 200, description: 'Token verified successfully, JWT token returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired Firebase token' })
  async verifyToken(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyFirebaseToken(dto.firebaseToken);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login with password',
    description: 'Login with phone number and password' 
  })
  @ApiResponse({ status: 200, description: 'Login successful, JWT token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto.phoneNumber, dto.password);
  }

  @Post('signup')
  @ApiOperation({ 
    summary: 'Sign up new user',
    description: 'Signup with OTP verification and set password' 
  })
  @ApiResponse({ status: 201, description: 'User created successfully, JWT token returned' })
  @ApiResponse({ status: 400, description: 'User already exists or invalid token' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signupWithPassword(dto.firebaseToken, dto.password);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset password with OTP verification' 
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or user not found' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.firebaseToken, dto.newPassword);
  }

  @Post('check-user')
  @ApiOperation({ 
    summary: 'Check user existence',
    description: 'Check if user exists and has password set' 
  })
  @ApiResponse({ status: 200, description: 'User status returned' })
  async checkUser(@Body() dto: CheckUserDto) {
    return this.authService.checkUserExists(dto.phoneNumber);
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
      firebaseUid: req.user.firebaseUid,
      phoneNumber: req.user.phoneNumber,
      email: req.user.email,
      displayName: req.user.displayName,
      role: req.user.role,
    };
  }
}

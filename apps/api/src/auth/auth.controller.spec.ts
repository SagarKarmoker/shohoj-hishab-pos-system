import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    verifyEmail: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPasswordWithToken: jest.fn(),
    resendVerificationEmail: jest.fn(),
    checkUserExists: jest.fn(),
    createUserBySales: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'SecurePass123',
      displayName: 'Test User',
    };

    it('should successfully signup a new user', async () => {
      const expectedResponse = { message: 'Signup successful. Please check your email to verify your account.' };
      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(signupDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.password,
        signupDto.displayName,
      );
    });

    it('should signup without displayName (optional field)', async () => {
      const dtoWithoutName = {
        email: 'test2@example.com',
        password: 'SecurePass123',
      };
      const expectedResponse = { message: 'Signup successful. Please check your email to verify your account.' };
      mockAuthService.signup.mockResolvedValue(expectedResponse);

      const result = await controller.signup(dtoWithoutName as any);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(
        dtoWithoutName.email,
        dtoWithoutName.password,
        undefined,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.signup.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(controller.signup(signupDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for weak password', async () => {
      mockAuthService.signup.mockRejectedValue(new BadRequestException('Password must be at least 8 characters'));

      await expect(controller.signup(signupDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      mockAuthService.signup.mockRejectedValue(new BadRequestException('Invalid email format'));

      await expect(controller.signup(signupDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('GET /auth/verify-email', () => {
    const token = 'valid-verification-token';

    it('should successfully verify email with valid token', async () => {
      const expectedResponse = {
        message: 'Email verified successfully',
        token: 'jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: UserRole.USER,
        },
      };
      mockAuthService.verifyEmail.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail(token);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(new BadRequestException('Invalid or expired token'));

      await expect(controller.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(new BadRequestException('Invalid or expired token'));

      await expect(controller.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'SecurePass123',
    };

    it('should successfully login with valid credentials', async () => {
      const expectedResponse = {
        token: 'jwt-token',
        user: {
          id: 'user-123',
          email: loginDto.email,
          displayName: 'Test User',
          role: UserRole.USER,
          emailVerified: true,
        },
        needsApproval: false,
      };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unverified email', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Email not verified'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Account is inactive'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/forgot-password', () => {
    const forgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send password reset link for existing email', async () => {
      const expectedResponse = { message: 'Password reset link sent to your email' };
      mockAuthService.requestPasswordReset.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(forgotPasswordDto.email);
    });

    it('should return success even for non-existent email (security)', async () => {
      const expectedResponse = { message: 'Password reset link sent to your email' };
      mockAuthService.requestPasswordReset.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword({ email: 'nonexistent@example.com' });

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('POST /auth/reset-password', () => {
    const resetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'NewSecurePass123',
    };

    it('should successfully reset password with valid token', async () => {
      const expectedResponse = { message: 'Password reset successfully' };
      mockAuthService.resetPasswordWithToken.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.resetPasswordWithToken).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockAuthService.resetPasswordWithToken.mockRejectedValue(new BadRequestException('Invalid or expired token'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for weak new password', async () => {
      mockAuthService.resetPasswordWithToken.mockRejectedValue(
        new BadRequestException('Password must be at least 8 characters'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /auth/resend-verification', () => {
    const resendVerificationDto = {
      email: 'test@example.com',
    };

    it('should resend verification email for unverified user', async () => {
      const expectedResponse = { message: 'Verification email sent' };
      mockAuthService.resendVerificationEmail.mockResolvedValue(expectedResponse);

      const result = await controller.resendVerification(resendVerificationDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.resendVerificationEmail).toHaveBeenCalledWith(resendVerificationDto.email);
    });

    it('should throw BadRequestException for already verified email', async () => {
      mockAuthService.resendVerificationEmail.mockRejectedValue(new BadRequestException('Email already verified'));

      await expect(controller.resendVerification(resendVerificationDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-existent email', async () => {
      mockAuthService.resendVerificationEmail.mockRejectedValue(new BadRequestException('Email not found'));

      await expect(controller.resendVerification(resendVerificationDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /auth/check-user', () => {
    const checkUserDto = {
      email: 'test@example.com',
    };

    it('should return user status for existing user', async () => {
      const expectedResponse = {
        exists: true,
        isVerified: true,
      };
      mockAuthService.checkUserExists.mockResolvedValue(expectedResponse);

      const result = await controller.checkUser(checkUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.checkUserExists).toHaveBeenCalledWith(checkUserDto.email);
    });

    it('should return exists false for non-existent user', async () => {
      const expectedResponse = {
        exists: false,
        isVerified: false,
      };
      mockAuthService.checkUserExists.mockResolvedValue(expectedResponse);

      const result = await controller.checkUser({ email: 'nonexistent@example.com' });

      expect(result).toEqual(expectedResponse);
    });

    it('should return isVerified false for unverified user', async () => {
      const expectedResponse = {
        exists: true,
        isVerified: false,
      };
      mockAuthService.checkUserExists.mockResolvedValue(expectedResponse);

      const result = await controller.checkUser(checkUserDto);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('POST /auth/sales/create-user (Protected)', () => {
    const createUserBySalesDto = {
      email: 'newuser@example.com',
      displayName: 'New User',
      phoneNumber: '+8801712345678',
    };

    const mockSalesReq = {
      user: {
        id: 'sales-123',
        role: UserRole.SALES,
      },
    };

    it('should create user by sales person', async () => {
      const expectedResponse = {
        message: 'User created successfully. Verification email sent.',
        user: {
          id: 'new-user-123',
          email: createUserBySalesDto.email,
          displayName: createUserBySalesDto.displayName,
        },
      };
      mockAuthService.createUserBySales.mockResolvedValue(expectedResponse);

      const result = await controller.createUserBySales(createUserBySalesDto, mockSalesReq as any);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.createUserBySales).toHaveBeenCalledWith(createUserBySalesDto, {
        id: mockSalesReq.user.id,
        role: mockSalesReq.user.role,
      });
    });

    it('should create user without optional fields', async () => {
      const dtoWithoutOptional = {
        email: 'newuser2@example.com',
      };
      const expectedResponse = {
        message: 'User created successfully. Verification email sent.',
        user: {
          id: 'new-user-456',
          email: dtoWithoutOptional.email,
        },
      };
      mockAuthService.createUserBySales.mockResolvedValue(expectedResponse);

      const result = await controller.createUserBySales(dtoWithoutOptional as any, mockSalesReq as any);

      expect(result).toEqual(expectedResponse);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.createUserBySales.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(controller.createUserBySales(createUserBySalesDto, mockSalesReq as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('GET /auth/profile (Protected)', () => {
    const mockReq = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.USER,
      },
    };

    it('should return user profile for authenticated user', async () => {
      const result = await controller.getProfile(mockReq as any);

      expect(result).toEqual({
        id: mockReq.user.id,
        email: mockReq.user.email,
        displayName: mockReq.user.displayName,
        role: mockReq.user.role,
      });
    });

    it('should handle profile without displayName', async () => {
      const reqWithoutName = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: UserRole.USER,
        },
      };

      const result = await controller.getProfile(reqWithoutName as any);

      expect(result).toEqual({
        id: reqWithoutName.user.id,
        email: reqWithoutName.user.email,
        displayName: undefined,
        role: reqWithoutName.user.role,
      });
    });
  });
});

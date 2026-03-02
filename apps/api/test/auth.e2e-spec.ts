import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should signup a new user with valid data', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'SecurePass123',
          displayName: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Signup successful');
        });
    });

    it('should reject signup with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
        })
        .expect(400);
    });

    it('should reject signup with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
        })
        .expect(400);
    });

    it('should reject signup with password missing uppercase', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'lowercase123',
        })
        .expect(400);
    });

    it('should reject signup with password missing number', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'NoNumberPass',
        })
        .expect(400);
    });

    it('should reject duplicate email signup', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'SecurePass123',
        })
        .expect(201);

      // Second signup with same email
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'SecurePass123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login for unverified email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'SecurePass123',
        })
        .expect(401);
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should reject login with missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(401);
    });

    it('should reject login with missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'SecurePass123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/verify-email', () => {
    it('should reject invalid verification token', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email')
        .query({ token: 'invalid-token' })
        .expect(400);
    });

    it('should reject expired verification token', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email')
        .query({ token: 'expired-token' })
        .expect(400);
    });

    it('should require token parameter', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email')
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should accept forgot password request for any email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'anyemail@example.com',
        })
        .expect(200);
    });

    it('should reject forgot password with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reject invalid reset token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewSecurePass123',
        })
        .expect(400);
    });

    it('should reject weak new password', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('should reject reset with missing token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          newPassword: 'NewSecurePass123',
        })
        .expect(400);
    });

    it('should reject reset with missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
        })
        .expect(400);
    });
  });

  describe('POST /auth/resend-verification', () => {
    it('should accept resend verification for any email', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'anyemail@example.com',
        })
        .expect(200);
    });

    it('should reject resend with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('POST /auth/check-user', () => {
    it('should check if user exists', () => {
      return request(app.getHttpServer())
        .post('/auth/check-user')
        .send({
          email: 'test@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('exists');
          expect(res.body).toHaveProperty('isVerified');
        });
    });

    it('should reject check with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/check-user')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('Protected Routes Without Authentication', () => {
    it('should reject GET /auth/profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject POST /auth/sales/create-user without token', () => {
      return request(app.getHttpServer())
        .post('/auth/sales/create-user')
        .send({
          email: 'newuser@example.com',
        })
        .expect(401);
    });
  });
});

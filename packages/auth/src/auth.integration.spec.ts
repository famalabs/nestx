/* eslint-disable max-len */
import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import {
  ArgumentsHost,
  CacheModuleOptions,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpStatus,
  INestApplication,
  Injectable,
  Logger,
  Module,
  NotFoundException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import {
  AuthOptions,
  ILoginResponse,
  INotificationSender,
  IUser,
  IUsersService,
  NOTIFICATION_CATEGORY,
  THIRD_PARTY_PROVIDER,
} from './interfaces';
import { EmailNotification, RefreshToken, UserIdentity } from './models';
import { mongoose, prop, buildSchema, getModelForClass } from '@typegoose/typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import {
  AUTH_OPTIONS,
  JWT_ERRORS,
  JWT_OPTIONS,
  LOGIN_ERRORS,
  PASSPORT_OPTIONS,
  REFRESH_TOKEN_ERRORS,
  SIGNUP_ERRORS,
} from './constants';
import { JwtModuleOptions } from '@nestjs/jwt';
import { IAuthModuleOptions } from '@nestjs/passport';
import { TokenService } from './token/token.service';
import { EmailDto, LoginDto, NotificationTokenDto, RefreshTokenDto, ResetPasswordDto, SignupDto } from './dto';
import { Request, Response } from 'express';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GRANT } from './acl/resolvers';
import { AuthService } from './auth.service';
import { EmailNotificationService } from './notification/email';
import { UserIdentityService } from './user-identity/user-identity.service';
import { LocalStrategy, JwtStrategy } from './strategies';
import { ExtractJwt } from 'passport-jwt';
import { ACL, ACLGuard, ACLManager, SuperGuard } from './acl';
import { BaseModel, CrudService } from '@famalabs/nestx-core';

import { JwtGuard } from '.';
import { FacebookGuard } from './facebook/guards';
import { GoogleGuard } from './google/guards';

const mongoURI = 'mongodb://localhost:27017/test';
const jwtModuleOptions: JwtModuleOptions = {
  secret: 'secret',
  signOptions: { expiresIn: 900 },
};

const passportModuleOptions: IAuthModuleOptions = {};

const cacheModuleOptions: CacheModuleOptions = {
  ttl: 900,
};

class MockUser extends BaseModel implements IUser {
  @prop({ required: true, unique: true })
  email!: string;

  @prop({
    required: true,
    minlength: 8,
  })
  password!: string;

  @prop({ type: () => [String] })
  roles!: string[];

  @prop({ required: true, default: false })
  isVerified!: boolean;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.status || 500;
    const message = exception.response ? exception.response.message : 'Internal server Error';
    response.status(status).json({
      message: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Injectable()
export class MockUsersService extends CrudService<DocumentType<MockUser>> implements IUsersService {
  constructor(
    @InjectModel(MockUser.name)
    private readonly userModel: ReturnModelType<typeof MockUser>,
  ) {
    super(userModel);
  }
  async findOneToValidate(email: string): Promise<MockUser> {
    return await this.userModel.findOne({ email: email }).select('+password').lean();
  }
  async findByEmail(email: string): Promise<MockUser> {
    return await this.userModel.findOne({ email: email }).lean();
  }
  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.findOne({ email: email });
    if (!userFromDb) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    userFromDb.password = newPassword;
    await userFromDb.save();
    return true;
  }
  async validateUser(email: string, password: string): Promise<MockUser> {
    const user = await this.findOneToValidate(email);
    if (user && user.email === email && user.password === password) {
      return user;
    }
    return null;
  }
}

@Injectable()
export class MockSender implements INotificationSender {
  notify(to: string): Promise<boolean>;
  notify(to: string, options: any): Promise<boolean>;
  notify(to: string, options: any, template: string): Promise<boolean>;
  async notify(to: any, options?: any, template?: any) {
    return true;
  }
}

@Controller('/test')
export class TestController {
  @Get('protected-jwt')
  @ACL(GRANT.ANY)
  @UseGuards(JwtGuard)
  protectedJwt() {
    return { value: 'Hello World!' };
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(mongoURI, {
      autoIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }),
  ],
})
class DbModule {}

export class MockGuard {
  canActivate() {
    return true;
  }
}

const authOptions: AuthOptions = {
  usersService: new MockUsersService(getModelForClass(MockUser)),
  notificationSender: new MockSender(),
  logger: new Logger(),
  aclManager: new ACLManager(),
  constants: {
    blockNotVerifiedUser: true,
    jwt: {
      refreshTokenTTL: 30,
      tokenFromRequestExtractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    mail: {
      auth: {
        user: '',
      },
      links: {
        emailVerification: '',
        forgotPassword: '',
      },
    },
    social: {
      facebook: {
        callbackURL: '',
        clientID: '',
        clientSecret: '',
        linkIdentity: {
          callbackURL: 'string',
        },
      },
      google: {
        callbackURL: '',
        clientID: '',
        clientSecret: '',
        linkIdentity: {
          callbackURL: 'string',
        },
      },
    },
  },
  passportModuleConfig: {},
  jwtModuleConfig: {},
};

describe('Auth Module integration', () => {
  let authService: AuthService;
  let userIdentityService: UserIdentityService;
  let authController: AuthController;
  let emailNotificationService: EmailNotificationService;
  let tokenService: TokenService;
  let usersService: IUsersService;
  let sender: INotificationSender;
  let app: INestApplication;
  let server;
  let options: AuthOptions;
  let jwtOptions: JwtModuleOptions;

  beforeEach(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      imports: [
        DbModule,
        MongooseModule.forFeature([
          { name: RefreshToken.name, schema: buildSchema(RefreshToken) },
          { name: EmailNotification.name, schema: buildSchema(EmailNotification) },
          { name: UserIdentity.name, schema: buildSchema(UserIdentity) },
          { name: MockUser.name, schema: buildSchema(MockUser) },
        ]),
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        TokenService,
        EmailNotificationService,
        UserIdentityService,
        JwtGuard,
        ACLGuard,
        { provide: AUTH_OPTIONS, useValue: authOptions },
        { provide: PASSPORT_OPTIONS, useValue: passportModuleOptions },
        { provide: JWT_OPTIONS, useValue: jwtModuleOptions },

        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        {
          provide: APP_GUARD,
          useClass: SuperGuard,
        },
      ],
      controllers: [AuthController, TestController],
    })
      .overrideGuard(GoogleGuard)
      .useValue(MockGuard)
      .overrideGuard(FacebookGuard)
      .useValue(MockGuard)
      .compile();

    authService = authModule.get<AuthService>(AuthService);
    authController = authModule.get<AuthController>(AuthController);
    options = authModule.get<AuthOptions>(AUTH_OPTIONS);
    jwtOptions = authModule.get<JwtModuleOptions>(JWT_OPTIONS);

    usersService = options.usersService;
    sender = options.notificationSender;
    userIdentityService = authModule.get<UserIdentityService>(UserIdentityService);
    emailNotificationService = authModule.get<EmailNotificationService>(EmailNotificationService);
    tokenService = authModule.get<TokenService>(TokenService);

    app = authModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: true }));
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async done => {
    jest.clearAllMocks();

    const mongoDbConnection = await mongoose.connect(mongoURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    const connection = mongoose.connection.name;
    if (connection === 'test') await mongoose.connection.dropDatabase();
    done();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(authController).toBeDefined();
  });
  describe('/auth/login (POST)', () => {
    it('should login user', async done => {
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };

      await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };

      const res = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: jwtOptions.signOptions.expiresIn,
        tokenType: 'Bearer',
      });
      done();
    });
    it('should not login not registered user', async done => {
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);
      const credentials: LoginDto = { email: 'notRegistered@email.com', password: user.password };

      const res = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe(LOGIN_ERRORS.USER_NOT_FOUND);
      done();
    });
    it('should warning user to login with third party identity', async done => {
      const user = {
        email: 'user@anotherEmail.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      const registeredUser = await usersService.create(user);

      const userIdentity = {
        externalId: 'googleId',
        email: 'user@gmail.com',
        provider: THIRD_PARTY_PROVIDER.GOOGLE,
        userId: registeredUser._id,
      };

      await userIdentityService.create(userIdentity);

      const credentials: LoginDto = { email: userIdentity.email, password: user.password };

      const res = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe(LOGIN_ERRORS.IDENTITY_LINKED);
      done();
    });
  });
  describe('3rd-party login', () => {
    it('should login a user with identity previously linked', async done => {
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      const registeredUser = await usersService.create(user);

      const userIdentity = {
        externalId: 'googleId',
        email: 'user@gmail.com',
        provider: THIRD_PARTY_PROVIDER.GOOGLE,
        userId: registeredUser._id,
      };

      await userIdentityService.create(userIdentity);

      //unable to mock google strategy and to mock Req in controller so i call the service methods directly
      const validateUserIdentity = await authService.validateThirdPartyIdentity(userIdentity);
      const getResponse = await authService.thirdPartyLogin(registeredUser._id, registeredUser.roles);

      expect(validateUserIdentity._id).toEqual(registeredUser._id);
      expect(getResponse).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: jwtOptions.signOptions.expiresIn,
        tokenType: 'Bearer',
      });
      done();
    });
    it('should warning a user that no identity exists but there is an account with the provided email', async done => {
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      const registeredUser = await usersService.create(user);

      const userIdentity = {
        externalId: 'googleId',
        email: 'user@gmail.com',
        provider: THIRD_PARTY_PROVIDER.GOOGLE,
      };

      //unable to mock google strategy and to mock Req in controller so i call the service methods directly
      try {
        await authService.validateThirdPartyIdentity(userIdentity);
      } catch (e) {
        expect(e.message).toEqual(LOGIN_ERRORS.USER_NOT_LINKED);
        expect(e.status).toEqual(HttpStatus.UNAUTHORIZED);
      }
      done();
    });
    it('should register user and create identity if identity and user not exist', async done => {
      const user = {
        email: 'user@gmail.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };

      const userIdentity = {
        externalId: 'googleId',
        email: 'user@gmail.com',
        provider: THIRD_PARTY_PROVIDER.GOOGLE,
      };

      //unable to mock google strategy and to mock Req in controller so i call the service methods directly
      const validatedUser = await authService.validateThirdPartyIdentity(userIdentity);
      const createdUser = await usersService.findById(validatedUser._id);
      const createdIdentity = await userIdentityService.findOne({ userId: validatedUser._id });

      expect(createdUser.email).toEqual(user.email);
      expect(createdIdentity.externalId).toEqual(userIdentity.externalId);
      expect(createdIdentity.provider).toEqual(userIdentity.provider);
      expect(createdIdentity.email).toEqual(user.email);

      done();
    });
  });
  describe('/auth/signup (POST)', () => {
    it('should signup user', async done => {
      jest.spyOn(sender, 'notify').mockResolvedValue(Promise.resolve(true));
      const data: SignupDto = { email: 'user@email.com', password: 'myPassword' };

      const res = await request(server).post('/auth/signup').send(data).set('Accept', 'application/json');
      expect(res.status).toBe(201);

      const savedUser = await usersService.findByEmail(data.email);
      expect(savedUser).not.toBeNull;
      done();
    });

    it('should not signup duplicate user', async done => {
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);

      const data: SignupDto = { email: user.email, password: 'myPassword' };
      const res = await request(server).post('/auth/signup').send(data).set('Accept', 'application/json');

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe(SIGNUP_ERRORS.USER_ALREADY_EXISTS);
      done();
    });
  });
  describe('access to protected route by JwtGuard', () => {
    it('should give the access with valid accessToken', async done => {
      //create and login a user
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };
      const loginRes = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');

      //save accessToken
      const loginResponse: ILoginResponse = loginRes.body;
      const res = await request(server)
        .get('/test/protected-jwt')
        .set('Authorization', 'Bearer ' + loginResponse.accessToken);

      expect(res.body).toEqual({ value: 'Hello World!' });
      done();
    });
    it('should not give the access with invalid accessToken', async done => {
      const res = await request(server)
        .get('/test/protected-jwt')
        .set('Authorization', 'Bearer ' + 'notValidAccessToken');

      expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual('Unauthorized');
      done();
    });
  });
  describe('/token (GET)', () => {
    it('should give new access and refresh token with a valid refresh token', async done => {
      //create and login a user
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };
      const loginRes = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');

      //save tokens
      const loginResponse: ILoginResponse = loginRes.body;
      const accessToken = loginResponse.accessToken;
      const refreshToken = loginResponse.refreshToken;

      const data: RefreshTokenDto = {
        grantType: 'refresh_token',
        refreshToken: refreshToken,
      };
      const res = await request(server).post('/auth/token').send(data);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: jwtOptions.signOptions.expiresIn,
        tokenType: 'Bearer',
      });
      expect(res.body.accessToken).not.toEqual(accessToken);
      expect(res.body.refreshToken).not.toEqual(refreshToken);
      done();
    });
    it('should not give new access and refresh token with a non existent refresh token', async done => {
      //create and login a user
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };
      const loginRes = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');

      //save tokens
      const loginResponse: ILoginResponse = loginRes.body;
      const accessToken = loginResponse.accessToken;
      const refreshToken = 'notExist';
      const data: RefreshTokenDto = {
        grantType: 'refresh_token',
        refreshToken: refreshToken,
      };
      const res = await request(server).post('/auth/token').send(data);

      expect(res.status).toEqual(HttpStatus.NOT_FOUND);
      expect(res.body.message).toEqual(REFRESH_TOKEN_ERRORS.TOKEN_NOT_FOUND);
      done();
    });
    it('should not give new access and refresh token with an invalid oldAccessToken', async done => {
      //create and login a user
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };
      const loginRes = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');

      //save tokens
      const loginResponse: ILoginResponse = loginRes.body;
      const accessToken = 'notValid';
      const refreshToken = loginResponse.refreshToken;

      const data: RefreshTokenDto = {
        grantType: 'refresh_token',
        refreshToken: refreshToken,
      };
      const res = await request(server).post('/auth/token').send(data);

      expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toEqual(JWT_ERRORS.TOKEN_NOT_VALID);
      done();
    });
  });
  describe('/logout (POST)', () => {
    it('should logout user', async done => {
      //create and login a user
      const user = {
        email: 'user@email.com',
        password: 'myPassword',
        isVerified: true,
        roles: [],
      };
      const registeredUser = await usersService.create(user);
      const credentials: LoginDto = { email: user.email, password: user.password };
      const loginRes = await request(server).post('/auth/login').send(credentials).set('Accept', 'application/json');

      //save accessToken
      const loginResponse: ILoginResponse = loginRes.body;
      const accessToken = loginResponse.accessToken;
      const refreshToken = loginResponse.refreshToken;

      const res = await request(server)
        .post('/auth/logout')
        .query({ refresh_token: refreshToken, from_all: false })
        .set('Authorization', 'Bearer ' + accessToken);

      done();
    });
  });
  // describe('signup & verify email', () => {
  //   it('should create an emailNotification for the new user and verify', async done => {
  //     jest.spyOn(sender, 'notify').mockResolvedValue(Promise.resolve(true));
  //     const data: SignupDto = { email: 'user@email.com', password: 'myPassword' };
  //     await request(server).post('/auth/signup').send(data).set('Accept', 'application/json');
  //     const savedUser = await usersService.findByEmail(data.email);
  //     expect(savedUser).not.toBeNull;

  //     const notification = await emailNotificationService.findOne({ to: savedUser.email });
  //     expect(notification).toBeDefined();
  //     expect(notification.category).toEqual(NOTIFICATION_CATEGORY.ACCOUNT_VERIFICATION);

  //     const notificationToken: NotificationTokenDto = {
  //       value: notification.token,
  //     };
  //     const res = await request(server).post(`/auth/email/verify`).send(notificationToken);
  //     const updatedUser = await usersService.findByEmail(savedUser.email);
  //     expect(res).toBeTruthy();
  //     expect(updatedUser.isVerified).toBeTruthy();
  //     done();
  //   });
  // });
  // describe('forgot & reset password', () => {
  //   it('should create an emailNotification for the user and reset password', async done => {
  //     jest.spyOn(sender, 'notify').mockResolvedValue(Promise.resolve(true));
  //     const user = {
  //       email: 'user@email.com',
  //       password: 'myPassword',
  //       isVerified: true,
  //       roles: [],
  //     };
  //     const registeredUser = await usersService.create(user);
  //     const data: EmailDto = {
  //       value: registeredUser.email,
  //     };
  //     let res;
  //     res = await request(server).post(`/auth/email/forgot-password`).send(data);
  //     const notification = await emailNotificationService.findOne({ to: registeredUser.email });
  //     expect(res).toBeTruthy;
  //     expect(notification).toBeDefined();
  //     expect(notification.category).toEqual(NOTIFICATION_CATEGORY.RESET_CREDENTIALS);

  //     const credentials: ResetPasswordDto = { token: notification.token, newPassword: 'myNewPassword' };
  //     res = await request(server).post(`/auth/email/reset-password`).send(credentials);
  //     const updatedUser = await usersService.findByEmail(registeredUser.email);
  //     expect(res).toBeTruthy;
  //     expect(updatedUser._id).toEqual(registeredUser._id);
  //     expect(updatedUser.password).toEqual(credentials.newPassword);
  //     done();
  //   });
  // });
});

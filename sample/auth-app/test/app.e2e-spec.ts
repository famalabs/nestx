import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/user.model';

describe('AppController (e2e)', () => {
  let server;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: true }));
    server = app.getHttpServer();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('/public (GET)', () => {
    it('should print a text message', async done => {
      const res = await request(server).get('/public');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello World from public!');
      done();
    });
  });

  describe('/auth/signup (POST)', () => {
    it('should signup user', async done => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ email: 'user@email.com', password: 'myPassword' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(201);
      done();
    });
    it('should not signup duplicate user', async done => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ email: 'user@email.com', password: 'myPassword' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(500);
      done();
    });
    it('should not signup user with invalid email', async done => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ email: 'notvalidemail', password: 'myPassword' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      done();
    });
    it('should not signup user with invalid password', async done => {
      const res = await request(server)
        .post('/auth/signup')
        .send({ email: 'user@email.com', password: '1' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(500);
      done();
    });
  });
  // describe('/auth/login (GET)', () => {
  //   it('should login user', async done => {
  //     const res = await request(server)
  //       .post('/auth/login')
  //       .send({ email: 'user@email.com', password: 'myPassword', clienId: '' })
  //       .set('Accept', 'application/json');
  //     expect(res.status).toBe(200);
  //     loginResponse = res.body;
  //     console.log(loginResponse);
  //     done();
  //   });
  // });
  describe('/protected-jwt (GET)', () => {
    it('should print a text message', async done => {
      // const res = await request(server).get('/protected-jwt').set('Authorization', 'abc123');
      // expect(res.status).toBe(200);
      // expect(res.text).toBe('Hello world from accessToken protected route!');
      done();
    });
    it('should not print a text message without access token', async done => {
      const res = await request(server).get('/protected-jwt');
      expect(res.status).toBe(500);
      done();
    });
    it('should not print a text message with invalid access token', async done => {
      const res = await request(server).get('/protected-jwt').set('Authorization', 'abc123');
      expect(res.status).toBe(500);
      done();
    });
    it('should not print a text message with blacklisted access token', async done => {
      done();
    });
  });
});

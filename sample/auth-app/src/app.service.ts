import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getPublic(): string {
    return 'Hello World from public!';
  }
  getJwt(): string {
    return 'Hello world from accessToken protected route!';
  }
}

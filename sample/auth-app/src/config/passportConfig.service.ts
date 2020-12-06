import { Injectable } from '@nestjs/common';
import { AuthOptionsFactory, IAuthModuleOptions } from '@nestjs/passport';

@Injectable()
export class PassportConfigService implements AuthOptionsFactory {
  createAuthOptions(): IAuthModuleOptions<any> | Promise<IAuthModuleOptions<any>> {
    return {};
  }
}

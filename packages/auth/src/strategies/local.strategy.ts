import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUsersService } from '../interfaces/users-service.interface';
import { LOGIN_ERRORS } from '../constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(IUsersService) private readonly usersService: IUsersService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string) {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException(LOGIN_ERRORS.WRONG_CREDENTIALS);
    }
    return {
      _id: user._id,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { User } from '../users/models/user.model';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { IUsersService, LOGIN_ERRORS } from '@famalabs/nestx-auth';
import { BaseService } from '../common/base-service';

/**
 * This class implements IUsersService from @famalabs/nestx-auth.
 * You must implement these methods to tell the @famalabs/nestx-auth pkg
 * how to handle certain auth aspects for users.
 */

@Injectable()
export class AuthUsersService extends BaseService<DocumentType<User>> implements IUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super(userModel);
  }

  async findOneToValidate(email: string): Promise<User> {
    return this.userModel.findOne({ email: email }).select('+password').lean();
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user: User = await this.findOneToValidate(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    userFromDb.password = newPassword;
    await userFromDb.save();
    return true;
  }
}

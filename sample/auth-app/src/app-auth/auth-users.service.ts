import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { User } from '../users/user.model';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { IUsersService, LOGIN_ERRORS } from '@famalabs/nestx-auth';
import { CrudService } from '@famalabs/nestx-core';

/**
 * This class implements IUsersService from @famalabs/nestx-auth.
 * You must implement these methods to tell the @famalabs/nestx-auth pkg
 * how to handle certain auth aspects for users.
 */

@Injectable()
export class AuthUsersService extends CrudService<DocumentType<User>> implements IUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super(userModel);
  }

  async findOneToValidate(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).select('+password').lean();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user: User = await this.findOneToValidate(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).lean();
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    userFromDb.password = newPassword;
    await userFromDb.save();
    return true;
  }
}

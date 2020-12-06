import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { IUsersService, LOGIN_ERRORS } from '@famalabs/nestx-auth';
import { CrudService } from '@famalabs/nestx-core';
import { User } from './user.model';

@Injectable()
export class UsersService extends CrudService<DocumentType<User>> implements IUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: ReturnModelType<typeof User>,
  ) {
    super(userModel);
  }

  async findOneToValidate(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).select('+password').exec();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user: User = await this.findOneToValidate(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email }).exec();
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) throw new NotFoundException(LOGIN_ERRORS.USER_NOT_FOUND);
    userFromDb.password = newPassword;
    await userFromDb.save();
    return true;
  }
}

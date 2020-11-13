import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserIdentity } from './models/user-identity.model';
import { BaseService } from './shared/base-service';
import { IThirdPartyUser } from './interfaces/third-party-user.interface';

/***
 * This class handle userCredentials
 *
 */

Injectable();
export class UserIdentityService extends BaseService<UserIdentity> {
  constructor(
    @InjectModel(UserIdentity.name)
    private readonly userIdentityModel: ReturnModelType<typeof UserIdentity>,
  ) {
    super(userIdentityModel);
  }

  async linkIdentity(thirdPartyUser: IThirdPartyUser, userId: string): Promise<UserIdentity> {
    const userIdentity = new UserIdentity();
    userIdentity.email = thirdPartyUser.email;
    userIdentity.externalId = thirdPartyUser.externalId;
    userIdentity.provider = thirdPartyUser.provider;
    userIdentity.accessToken = thirdPartyUser.accessToken;
    userIdentity.refreshToken = thirdPartyUser.refreshToken;
    userIdentity.userId = userId;
    return await this.create(userIdentity);
  }
}

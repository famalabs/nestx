import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(UserIdentityService.name);
  constructor(
    @InjectModel(UserIdentity.name)
    private readonly userIdentityModel: ReturnModelType<typeof UserIdentity>,
  ) {
    super(userIdentityModel);
  }

  async linkIdentity(thirdPartyUser: IThirdPartyUser, userId: string): Promise<UserIdentity> {
    this.logger.debug(`linkIdentity thirdPartyUser:${JSON.stringify(thirdPartyUser)}, userId:${userId}`);
    const userIdentity = {
      email: thirdPartyUser.email,
      externalId: thirdPartyUser.externalId,
      provider: thirdPartyUser.provider,
      accessToken: thirdPartyUser.accessToken,
      refreshToken: thirdPartyUser.refreshToken,
      userId: userId,
    };
    return await this.create(userIdentity);
  }
}

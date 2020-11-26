import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserIdentity } from './models/user-identity.model';
import { IThirdPartyUser } from './interfaces/third-party-user.interface';
import { IAuthLogger } from './interfaces';
import { CrudService } from '@famalabs/nestx-core';

/***
 * This class handle userCredentials
 *
 */

Injectable();
export class UserIdentityService extends CrudService<DocumentType<UserIdentity>> {
  constructor(
    @InjectModel(UserIdentity.name)
    private readonly userIdentityModel: ReturnModelType<typeof UserIdentity>,
    @Inject('LOGGER') private readonly logger: IAuthLogger,
  ) {
    super(userIdentityModel);
  }

  async linkIdentity(thirdPartyUser: IThirdPartyUser, userId: string): Promise<UserIdentity> {
    this.logger.debug(
      `linkIdentity thirdPartyUser:${JSON.stringify(thirdPartyUser)}, userId:${userId}`,
      UserIdentityService.name,
    );
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

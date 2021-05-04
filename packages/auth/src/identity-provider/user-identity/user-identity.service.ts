import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserIdentity } from '../../models/user-identity.model';
import { IThirdPartyUser } from '../../interfaces/oauth/third-party-user.interface';
import { CrudService } from '@famalabs/nestx-core';
import { AUTH_OPTIONS } from '../../constants';
import { AuthOptions } from '../../interfaces';

/***
 * This class handle userCredentials
 *
 */

Injectable();
export class UserIdentityService extends CrudService<DocumentType<UserIdentity>> {
  private readonly logger: LoggerService;

  constructor(
    @InjectModel(UserIdentity.name)
    private readonly userIdentityModel: ReturnModelType<typeof UserIdentity>,
    @Inject(AUTH_OPTIONS) private _AuthOptions: AuthOptions,
  ) {
    super(userIdentityModel);
    this.logger = this._AuthOptions.logger;
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

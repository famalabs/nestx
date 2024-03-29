export enum THIRD_PARTY_PROVIDER {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}
export interface IThirdPartyUser {
  externalId: string;
  email: string;
  accessToken?: string;
  provider: THIRD_PARTY_PROVIDER;
}

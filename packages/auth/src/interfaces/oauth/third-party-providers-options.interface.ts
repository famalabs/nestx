export interface IThirdPartyProviderOptions {
  callbackURL: string;
  clientID: string;
  clientSecret: string;
  linkIdentity: {
    callbackURL: string;
  };
}

export interface IThirdPartyProviderOptions {
  callbackURL: string;
  clientID: string;
  clientSecret: string;
  linkCallbackURL: string;
  scope?: string[];
  strategyOptions?: { [key: string]: any };
}

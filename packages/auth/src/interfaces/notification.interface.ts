export enum NOTIFICATION_CATEGORY {
  ACCOUNT_VERIFICATION = 'account_verification',
  RESET_CREDENTIALS = 'reset_credential',
}
export interface INotification {
  _id?: string;
  to: string;
  category: NOTIFICATION_CATEGORY;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEmailNotification extends INotification {
  _id?: string;
  to: string;
  category: NOTIFICATION_CATEGORY;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}


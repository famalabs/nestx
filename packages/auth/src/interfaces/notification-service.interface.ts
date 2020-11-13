export interface INotificationService {
  notify(to: string): Promise<boolean>;
  notify(to: string, options: any): Promise<boolean>;
  notify(to: string, options: any, template: string): Promise<boolean>;
}

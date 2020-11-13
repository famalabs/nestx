import { Inject, Injectable } from '@nestjs/common';
import { IAuthenticationModuleOptions } from '..';
import { AUTH_OPTIONS } from '../constants';
import { INotificationService } from '../interfaces/notification-service.interface';
import * as nodemailer from 'nodemailer';
import { IEmailOptions } from './email-options.interface';
import { EmailNotification } from '../models/email-notification.model';
import { ReturnModelType } from '@typegoose/typegoose';
import { BaseService } from '../shared/base-service';
import { InjectModel } from '@nestjs/mongoose';

/***
 * This class send an email notification
 *
 * TODO: this class is a job queue producer EmailJob(to,IEmailOption,template)
 *  then the consumer take the EmailJob, creates a template and send the email (maybe another queue for templating)
 */

Injectable();
export class EmailNotificationService extends BaseService<EmailNotification> implements INotificationService {
  constructor(
    @InjectModel(EmailNotification.name)
    private readonly emailNotificationModel: ReturnModelType<typeof EmailNotification>,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super(emailNotificationModel);
  }
  async notify(to: string): Promise<boolean>;
  async notify(to: string, options: IEmailOptions): Promise<boolean>;
  async notify(to: string, options: IEmailOptions, template: string): Promise<boolean>;
  async notify(to: any, options?: any, template?: any) {
    const transporter = nodemailer.createTransport({
      host: this.options.constants.mail.host,
      port: this.options.constants.mail.port,
      secure: this.options.constants.mail.secure,
      requireTLS: this.options.constants.mail.requireTLS,

      auth: {
        user: this.options.constants.mail.auth.user,
        pass: this.options.constants.mail.auth.password,
      },
    });

    const sent = await new Promise<boolean>(async function (resolve, reject) {
      return await transporter.sendMail(options, async (error, info) => {
        if (error) {
          console.log('Message sent: %s', error);
          return reject(false);
        }
        console.log('Message sent: %s', info.messageId);
        resolve(true);
      });
    });
    return sent;
  }
}

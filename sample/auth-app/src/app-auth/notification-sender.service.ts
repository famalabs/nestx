import { Injectable } from '@nestjs/common';
import { IEmailOptions, INotificationSender } from '@famalabs/nestx-auth';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailSenderService implements INotificationSender {
  async notify(to: string): Promise<boolean>;
  async notify(to: string, options: IEmailOptions): Promise<boolean>;
  async notify(to: string, options: IEmailOptions, template: string): Promise<boolean>;
  async notify(to: any, options?: any, template?: any) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      requireTLS: false,
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
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

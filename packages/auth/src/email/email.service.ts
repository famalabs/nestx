import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { AUTH_OPTIONS } from '../constants';
import { BaseService } from '../shared/base-service';
import { EmailVerification } from '../models/email-verification.model';
import * as nodemailer from 'nodemailer';
import { IAuthenticationModuleOptions } from '../interfaces';
import { IEmailOptions } from './mail-options.interface';

@Injectable()
export class EmailService extends BaseService<EmailVerification> {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly emailModel: ReturnModelType<typeof EmailVerification>,
    @Inject(AUTH_OPTIONS) private options: IAuthenticationModuleOptions,
  ) {
    super(emailModel);
  }

  async sendEmail(email: string, mailOptions: IEmailOptions): Promise<boolean> {
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
      return await transporter.sendMail(mailOptions, async (error, info) => {
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

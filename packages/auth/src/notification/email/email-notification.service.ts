import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from '../../shared/base-service';
import { EmailNotification } from '../../models';

/***
 * This class send an email notification
 *
 * TODO: this class is a job queue producer EmailJob(to,IEmailOption,template)
 *  then the consumer take the EmailJob, creates a template and send the email (maybe another queue for templating)
 */

Injectable();
export class EmailNotificationService extends BaseService<EmailNotification> {
  constructor(
    @InjectModel(EmailNotification.name)
    private readonly emailNotificationModel: ReturnModelType<typeof EmailNotification>,
  ) {
    super(emailNotificationModel);
  }
}

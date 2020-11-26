import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { EmailNotification } from '../../models';
import { CrudService, Where } from '@famalabs/nestx-core';

/***
 * This class send an email notification
 *
 * TODO: this class is a job queue producer EmailJob(to,IEmailOption,template)
 *  then the consumer take the EmailJob, creates a template and send the email (maybe another queue for templating)
 */

Injectable();
export class EmailNotificationService extends CrudService<DocumentType<EmailNotification>> {
  constructor(
    @InjectModel(EmailNotification.name)
    private readonly emailNotificationModel: ReturnModelType<typeof EmailNotification>,
  ) {
    super(emailNotificationModel);
  }

  async findOneAndUpdate(conditions = {}, update = {}, options = {}): Promise<DocumentType<EmailNotification>> {
    try {
      return await this.model.findOneAndUpdate(conditions, update, options).exec();
    } catch (e) {
      throw new UnprocessableEntityException(e.message);
    }
  }
}

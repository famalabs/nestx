import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';

import { Book } from './models/book.model';
import { CrudService } from '@famalabs/nestx-core';
@Injectable()
export class BooksService extends CrudService<DocumentType<Book>> {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: ReturnModelType<typeof Book>,
  ) {
    super(bookModel);
  }
}

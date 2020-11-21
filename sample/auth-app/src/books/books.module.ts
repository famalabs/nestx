import {
  InstanceMiddleware,
  InstanceExtractor,
  INSTANCE_EXTRACTOR,
  Instance,
} from '@famalabs/nestx-auth';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { buildSchema, getModelForClass, mongoose } from '@typegoose/typegoose';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './models/book.model';

const instanceExtractor: InstanceExtractor = async (id: string) => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const model = getModelForClass(Book);
  const service = new BooksService(model);
  const data = await service.findById(id);
  const result: Instance = {
    data: data,
    user: data.user,
  };
  return result;
};

@Module({
  imports: [MongooseModule.forFeature([{ name: Book.name, schema: buildSchema(Book) }])],
  controllers: [BooksController],
  providers: [BooksService, { provide: INSTANCE_EXTRACTOR, useValue: instanceExtractor }],
})
export class BooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InstanceMiddleware).forRoutes({ path: '/books/:id', method: RequestMethod.GET });
  }
}

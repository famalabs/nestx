import { Module } from '@nestjs/common';
import { User } from './models/user.model';
import { MongooseModule } from '@nestjs/mongoose';

/**
 * In your app you can add your imports,controllers and providers.
 * Remember to export MongooseModule because it is used by AppAuthModule.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: User.schema }])],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class UsersModule {}

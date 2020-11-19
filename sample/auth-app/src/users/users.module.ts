import { Module } from '@nestjs/common';
import { User } from './user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';

/**
 * In your app you can add your imports,controllers and providers.
 * Remember to export MongooseModule because it is used by AppAuthModule.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: User.schema }])],
  controllers: [UsersController],
  providers: [],
  exports: [MongooseModule],
})
export class UsersModule {}

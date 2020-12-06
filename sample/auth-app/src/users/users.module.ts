import { Global, Module } from '@nestjs/common';
import { User } from './user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { buildSchema } from '@typegoose/typegoose';
import { UsersService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: buildSchema(User) }])],
  controllers: [],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}

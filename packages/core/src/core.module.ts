import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { CoreController } from '@app/core/core.controller';

@Module({
  controllers: [CoreController],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}

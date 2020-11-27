import { Controller } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { CountFilter, InstanceFilter, ListFilter } from './model';

@Controller('core')
// @ApiExtraModels(ListFilter, CountFilter, InstanceFilter)
export class CoreController {}

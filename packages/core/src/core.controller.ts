import { Controller } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { Where } from './model';

@Controller('core')
// @ApiExtraModels(Where)
export class CoreController {}

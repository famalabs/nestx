import { Controller } from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { Filter, ItemFilter, Where } from '@app/core/model';

@Controller('core')
@ApiExtraModels(Filter, Where, ItemFilter)
export class CoreController {
}

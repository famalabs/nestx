import {Filter} from './filter.dto';
import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional} from "class-validator";
import {Transform, Type} from "class-transformer";
import {AppQuery} from "./app-query.dto";

export class AppFilter extends Filter {
    @ApiPropertyOptional({type: AppQuery})
    @IsOptional()
    @Type(() => AppQuery)
    @Transform(value => new AppQuery(value))
    where?: AppQuery;
}

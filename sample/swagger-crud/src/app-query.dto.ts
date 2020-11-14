import {Filter} from './filter.dto';
import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class AppQuery {
    @ApiPropertyOptional()
    test: number;

    constructor(obj: Partial<AppQuery>) {
        Object.assign(this, obj);
    }
}

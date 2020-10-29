import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  newPassword!: string;

  @ApiProperty({ required: true })
  @IsString()
  token!: string;
}

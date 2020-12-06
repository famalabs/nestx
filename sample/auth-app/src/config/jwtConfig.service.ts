import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtOptionsFactory, JwtModuleOptions } from "@nestjs/jwt";

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    return {
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
      signOptions: { expiresIn: parseInt(this.configService.get<string>('ACCESS_TOKEN_TTL'), 10) },
    };
  }
}
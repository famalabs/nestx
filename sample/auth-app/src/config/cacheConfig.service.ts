import { Injectable, CacheOptionsFactory, CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createCacheOptions(): CacheModuleOptions | Promise<CacheModuleOptions> {
    return {
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: parseInt(this.configService.get<string>('ACCESS_TOKEN_TTL'), 10),
    };
  }
}

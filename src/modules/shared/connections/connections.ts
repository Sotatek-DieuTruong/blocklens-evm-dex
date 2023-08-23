import databaseConfig from 'config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as _ from 'lodash';

export function getConnectionOptions() {
  const databases = databaseConfig();
  return _.map(databases, (database) => {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        return {
          name: database.name,
          type: 'postgres',
          url: database.uri,
          synchronize: false,
          entities: [__dirname + '/../../../database/entities/*.entity.{js,ts}'],
          connectTimeout: 30000,
        };
      },
      inject: [ConfigService],
      name: database.name,
    });
  });
}

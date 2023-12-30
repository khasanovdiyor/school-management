import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { SubjectsModule } from './subjects/subjects.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LoggerModule,
    DatabaseModule,
    SubjectsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

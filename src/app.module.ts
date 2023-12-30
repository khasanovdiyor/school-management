import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { SubjectsModule } from './subjects/subjects.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    SubjectsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import 'dotenv/config';

import { DataSource } from 'typeorm';

import configuration from '../config';

const dbConfig = configuration().database;

export const connectionSource = new DataSource({
  ...dbConfig,
  synchronize: false,
  entities: ['dist/**/**.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*{.ts,.js}'],
});

import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dbConfig = (): PostgresConnectionOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSL === 'true',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  get synchronize() {
    return process.env.NODE_ENV === 'development' ? true : false;
  },
  migrationsRun: false,
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
});

export default dbConfig();

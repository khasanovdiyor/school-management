import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { dbConfig } from './database';

interface ConfigInterface {
  env: string;
  port: number;
  database: PostgresConnectionOptions;
  jwt: {
    access: {
      secret: string;
      expiresIn: string;
    };
    refresh: {
      secret: string;
      expiresIn: string;
    };
  };
  auth: {
    saltRounds: number;
    pepper: string;
  };
  isDevEnv: boolean;
}

export default (): Partial<ConfigInterface> => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  },
  auth: {
    saltRounds: 10,
    pepper: process.env.PEPPER,
  },
  database: dbConfig(),
  get isDevEnv() {
    return this.env === 'development';
  },
});

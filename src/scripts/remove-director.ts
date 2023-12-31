import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { UserRole } from 'src/users/enums/user-role.enum';

import yargs = require('yargs');
async function bootstrap() {
  const argv = yargs(hideBin(process.argv))
    .usage(`Usage: npm run remove-director -- --phone [string]`)
    .options({
      phone: {
        demandOption: true,
        describe: 'Phone number',
        type: 'string',
      },
    })
    .parseSync();

  const app = await NestFactory.createApplicationContext(AppModule);

  const logger = await app.resolve(LoggerService);

  const userService = app.get(UsersService);

  try {
    const user = await userService.findOneByPhoneNumber(argv.phone);
    if (user.role !== UserRole.Director) {
      logger.warn('User is not a director');
    } else {
      await userService.removeByPhoneNumber(argv.phone);
      logger.log('Director is removed');
    }
  } catch (err) {
    logger.error(err);
  } finally {
    await app.close();
    process.exit();
  }
}

bootstrap();

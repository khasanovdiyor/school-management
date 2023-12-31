import { hideBin } from 'yargs/helpers';
import { NestFactory } from '@nestjs/core';
import { validate } from 'class-validator';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/enums/user-role.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoggerService } from 'src/common/logger/logger.service';
import { PgErrorCode } from 'src/common/enums/pg-error.enum';

import yargs = require('yargs');
async function bootstrap() {
  console.log(process.argv);
  const argv = yargs(hideBin(process.argv))
    .usage(
      `Usage: npm run create:director -- --firstName [string] --lastName [string] --phoneNumber [string] --password [string]`,
    )
    .options({
      firstName: {
        demandOption: true,
        describe: 'First name',
        type: 'string',
      },
      lastName: {
        demandOption: true,
        describe: 'Last name',
        type: 'string',
      },
      phone: {
        demandOption: true,
        describe: 'Phone number',
        type: 'string',
      },
      password: {
        demandOption: true,
        describe: 'Password',
        type: 'string',
      },
    })
    .parseSync();

  const app = await NestFactory.createApplicationContext(AppModule);

  const createUserDto = new CreateUserDto();
  createUserDto.firstName = argv.firstName;
  createUserDto.lastName = argv.lastName;
  createUserDto.phoneNumber = argv.phone;
  createUserDto.role = UserRole.Director;
  createUserDto.password = argv.password;

  const logger = await app.resolve(LoggerService);

  const errors = await validate(createUserDto);
  if (errors.length > 0) {
    logger.error(errors.flatMap((err) => Object.values(err.constraints)));
    await app.close();
    process.exit();
  }

  const userService = app.get(UsersService);

  try {
    await userService.create(createUserDto);
  } catch (err) {
    if (err.code === PgErrorCode.UniqueConstraint) {
      logger.error('User with this phone number already exists');
    } else {
      logger.error(err);
    }
  } finally {
    await app.close();
    process.exit();
  }
}

bootstrap();

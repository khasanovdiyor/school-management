import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PgErrorCode } from 'src/common/enums/pg-error.enum';
import { CustomRepository } from 'src/database/custom-repository.decorator';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@CustomRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(createUserDto: CreateUserDto) {
    const { password } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ ...createUserDto, password: hashedPassword });

    try {
      return this.save(user);
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(
          'User with the same phone number already exists',
        );
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}

import { DataSource, Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PgErrorCode } from 'src/common/enums/pg-error.enum';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password.service';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserDto) {
    const { password } = createUserDto;

    const hashedPassword = await this.passwordService.hashPassword(password);

    const newUser = this.create({ ...createUserDto, password: hashedPassword });

    try {
      const user = await this.save(newUser);
      return user;
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(
          'User with the same phone number already exists',
        );
      }
      throw new InternalServerErrorException();
    }
  }
}

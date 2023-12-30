import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { notFoundMessage } from 'src/common/constants/notFoundMessage';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(notFoundMessage(User.name, id));
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(notFoundMessage(User.name, id));
    }

    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.usersRepository.delete(id);
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}

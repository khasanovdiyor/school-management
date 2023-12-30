import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PgErrorCode } from 'src/common/enums/pg-error.enum';
import { notFoundMessage } from 'src/common/constants/notFoundMessage';
import { UsersService } from 'src/users/users.service';
import { SubjectsService } from 'src/subjects/subjects.service';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly repository: Repository<Group>,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const newGroup = this.repository.create(createGroupDto);
    try {
      const group = await this.repository.save(newGroup);
      return group;
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(`A Group with this name already exists`);
      }
    }
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const group = await this.repository.findOneBy({ id });

    if (!group) {
      throw new NotFoundException(notFoundMessage(Group.name, id));
    }
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.repository.preload({
      id,
      ...updateGroupDto,
    });

    if (!group) {
      throw new NotFoundException(notFoundMessage(Group.name, id));
    }

    return this.repository.save(group);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.repository.delete(id);
    } catch (err) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async addStudents(id: number, studentIds: number[]) {
    const students = await this.usersService.getStudents(studentIds);

    const group = await this.findOne(id);
    group.students = [...group.students, ...students];

    return this.repository.save(group);
  }

  async addSubjects(id: number, subjectIds: number[]) {
    const subjects = await this.subjectsService.findSubjectsById(subjectIds);

    const group = await this.findOne(id);
    group.subjects = subjects;
    return this.repository.save(group);
  }
}

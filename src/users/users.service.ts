import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { notFoundMessage } from 'src/common/constants/notFoundMessage';
import { SubjectsService } from 'src/subjects/subjects.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly subjectsService: SubjectsService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.repository.createUser(createUserDto);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(notFoundMessage(User.name, id));
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(notFoundMessage(User.name, id));
    }

    return this.repository.save(user);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.repository.delete(id);
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getStudents(studentIds: number[]) {
    const students = await Promise.all(
      studentIds.map((id) =>
        this.repository.findOne({ where: { id }, select: ['id', 'role'] }),
      ),
    );

    const notFoundUsers = studentIds.filter(
      (id, idx) => students[idx]?.id !== id,
    );

    if (notFoundUsers.length) {
      throw new NotFoundException(
        `Users with ids: ${notFoundUsers.join(', ')} not found`,
      );
    }

    if (students.some((user) => user.role !== UserRole.Student)) {
      throw new ConflictException('Make sure to provide only list of students');
    }

    return students;
  }

  async addSubjectsToTeacher(teacherId: number, subjectIds: number[]) {
    const teacher = await this.findOne(teacherId);

    if (teacher.role !== UserRole.Teacher) {
      throw new BadRequestException('Please provide a techer id');
    }

    const subjects = await this.subjectsService.findSubjectsById(subjectIds);

    teacher.teacherSubjects = subjects;

    return this.repository.save(teacher);
  }
}

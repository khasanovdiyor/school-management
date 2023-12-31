import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { notFoundMessage } from 'src/common/constants/notFoundMessage';
import { SubjectsService } from 'src/subjects/subjects.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { StudentGrade } from './entities/student-grade.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(StudentGrade)
    private readonly studentGradeRepository: Repository<StudentGrade>,
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

  async findOneTeacherWithSubjects(id: number) {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['teacherSubjects'],
    });

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
      throw new InternalServerErrorException();
    }
  }

  async getStudents(studentIds: number[]) {
    const students = await Promise.all(
      studentIds.map((id) =>
        this.repository.findOne({
          where: { id },
          select: ['id', 'role'],
          relations: ['group'],
        }),
      ),
    );

    const notFoundUsers = studentIds.filter(
      (id, idx) => students[idx]?.id !== id,
    );

    if (notFoundUsers.length) {
      throw new NotFoundException(
        `Students with ids: ${notFoundUsers.join(', ')} not found`,
      );
    }

    if (students.some((user) => user.role !== UserRole.Student)) {
      throw new ConflictException('Make sure to provide only list of students');
    }

    return students;
  }

  async addSubjectsToTeacher(teacherId: number, subjectIds: number[]) {
    const teacher = await this.findOneTeacherWithSubjects(teacherId);

    if (teacher.role !== UserRole.Teacher) {
      throw new BadRequestException('Please provide a techer id');
    }

    const subjects = await this.subjectsService.findSubjectsById(subjectIds);

    teacher.teacherSubjects = [...teacher.teacherSubjects, ...subjects];

    return this.repository.save(teacher);
  }

  async getTeacherWithSubject(teacherId: number, subjectId: number) {
    const teacher = await this.repository.findOne({
      relations: ['teacherSubjects'],
      where: { id: teacherId, teacherSubjects: { id: subjectId } },
    });

    if (!teacher.teacherSubjects.length) {
      throw new BadRequestException(`You don't teacher this subject`);
    }
  }

  async getAverageGrades(studentId: number) {
    await this.getStudents([studentId]);

    const queryBuilder = await this.studentGradeRepository
      .createQueryBuilder('grade')
      .leftJoin('grade.student', 'student')
      .leftJoin('grade.subject', 'subject')
      .where('student.id = :studentId', { studentId })
      .groupBy('subject.id');

    const results = await queryBuilder
      .select(
        'subject.name as subject, AVG(CAST(CAST(grade.grade AS text) AS INTEGER)) as average',
      )
      .getRawMany();

    return results;
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    const user = await this.repository.findOne({
      where: { phoneNumber },
      select: ['id', 'phoneNumber', 'password'],
    });

    if (!user) {
      throw new NotFoundException(`User not found with number ${phoneNumber}`);
    }

    return user;
  }

  async removeByPhoneNumber(phoneNumber: string) {
    await this.findOneByPhoneNumber(phoneNumber);

    try {
      await this.repository.delete({ phoneNumber });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}

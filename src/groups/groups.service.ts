import {
  BadRequestException,
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
import { UserRole } from 'src/users/enums/user-role.enum';
import { StudentGrade } from 'src/users/entities/student-grade.entity';
import { LoggerService } from 'src/common/logger/logger.service';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { GroupTeacherSubject } from './entities/group-teacher-subject.entity';
import { GradeStudentForSubjectDto } from './dto/grade-student-for-subject.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly repository: Repository<Group>,
    @InjectRepository(GroupTeacherSubject)
    private readonly groupTeacherSubjectRepository: Repository<GroupTeacherSubject>,
    @InjectRepository(StudentGrade)
    private readonly studentGradeRepository: Repository<StudentGrade>,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
    private readonly loggerService: LoggerService,
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
      throw new InternalServerErrorException();
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

  async addTeacherForSubject(id: number, addTeacherDto: AddTeacherDto) {
    const { teacherId, subjectId } = addTeacherDto;

    const group = await this.repository.findOne({
      loadRelationIds: true,
      where: { id, subjects: { id: subjectId } },
    });

    const subject = group.subjects[0];
    if (!subject) {
      throw new BadRequestException(`This subject doesn't exist in this group`);
    }

    const teacher = await this.usersService.findOne(teacherId);

    if (teacher.role !== UserRole.Teacher) {
      throw new BadRequestException('Please provide a teacher');
    }

    const groupTeacherSubject = new GroupTeacherSubject();
    groupTeacherSubject.group = group;
    groupTeacherSubject.subject = subject;
    groupTeacherSubject.teacher = teacher;

    try {
      const res =
        await this.groupTeacherSubjectRepository.save(groupTeacherSubject);
      return res;
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(
          'This teacher already teaches this subject to this group',
        );
      }
    }
  }

  async gradeStudentForSubject(
    groupId: number,
    gradeStudentForSubjectDto: GradeStudentForSubjectDto,
    teacherId: number,
  ) {
    const { subjectId, studentId, grade } = gradeStudentForSubjectDto;

    const groupTeacherSubject =
      await this.groupTeacherSubjectRepository.findOne({
        relations: ['subject'],
        where: {
          subject: { id: subjectId },
          teacher: { id: teacherId },
          group: { id: groupId },
        },
      });

    if (!groupTeacherSubject) {
      throw new BadRequestException(
        `You don't teach this subject to this group`,
      );
    }

    const [student] = await this.usersService.getStudents([studentId]);
    const newStudentGrade = new StudentGrade();
    newStudentGrade.grade = grade;
    newStudentGrade.student = student;
    newStudentGrade.subject = groupTeacherSubject.subject;

    try {
      const studentGrade =
        await this.studentGradeRepository.save(newStudentGrade);
      return studentGrade;
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(
          `Student with id${studentId} has already been graded for subject with id ${subjectId}`,
        );
      }
    }
  }

  async getAverageGradeForGivenGroupAndSubject(groupId: number, subjectId) {
    try {
      const queryBuilder = this.studentGradeRepository
        .createQueryBuilder('grade')
        .leftJoin('grade.student', 'student')
        .leftJoin('grade.subject', 'subject')
        .where('student.group.id = :groupId', { groupId })
        .andWhere('subject.id = :subjectId', { subjectId });

      const result = await queryBuilder
        .select(
          'AVG(CAST(CAST(grade.grade as TEXT) as INTEGER))',
          'averageGrade',
        )
        .getRawOne();
      return result.averageGrade ? result : { averageGrade: 0 };
    } catch (err) {
      this.loggerService.error(err);
      throw new InternalServerErrorException();
    }
  }
}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PgErrorCode } from 'src/common/enums/pg-error.enum';
import { notFoundMessage } from 'src/common/constants/notFoundMessage';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const newSubject = this.subjectsRepository.create(createSubjectDto);
    try {
      const subject = await this.subjectsRepository.save(newSubject);
      return subject;
    } catch (err) {
      if (err.code === PgErrorCode.UniqueConstraint) {
        throw new ConflictException(`A Subject with this name already exists`);
      }
    }
  }

  findAll() {
    return this.subjectsRepository.find();
  }

  async findOne(id: number) {
    const subject = await this.subjectsRepository.findOneBy({ id });

    if (!subject) {
      throw new NotFoundException(notFoundMessage(Subject.name, id));
    }
    return subject;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.subjectsRepository.preload({
      id,
      ...updateSubjectDto,
    });

    if (!subject) {
      throw new NotFoundException(notFoundMessage(Subject.name, id));
    }

    return this.subjectsRepository.save(subject);
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.subjectsRepository.delete(id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async findSubjectsById(subjectIds: number[]) {
    const subjects = await this.subjectsRepository.find({
      where: { id: In(subjectIds) },
    });

    return subjects;
  }
}

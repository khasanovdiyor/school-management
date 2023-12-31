import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectsModule } from 'src/subjects/subjects.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { PasswordService } from './password.service';
import { StudentGrade } from './entities/student-grade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository, StudentGrade]),
    SubjectsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PasswordService],
  exports: [UsersRepository, UsersService, PasswordService],
})
export class UsersModule {}

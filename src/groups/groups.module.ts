import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { StudentGrade } from 'src/users/entities/student-grade.entity';

import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './entities/group.entity';
import { GroupTeacherSubject } from './entities/group-teacher-subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupTeacherSubject, StudentGrade]),
    UsersModule,
    SubjectsModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}

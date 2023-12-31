import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';

import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddEntitiesDto } from '../common/entities/add-entities.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { GradeStudentForSubjectDto } from './dto/grade-student-for-subject.dto';

@UseGuards(JwtAccessGuard)
@Controller({ path: 'groups', version: '1' })
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Post(':id/addStudents')
  addStudentsToAGroup(
    @Param('id') groupId: string,
    @Body() addStudentsDto: AddEntitiesDto,
  ) {
    return this.groupsService.addStudents(+groupId, addStudentsDto.entityIds);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Post(':id/addSubjects')
  addSubjectsToAGroup(
    @Param('id') groupId: string,
    @Body() addSubjectsDto: AddEntitiesDto,
  ) {
    return this.groupsService.addSubjects(+groupId, addSubjectsDto.entityIds);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @Post(':id/addTeacherForSubject')
  addTeacherForSubject(
    @Param('id') groupId: string,
    @Body() addTeacherDto: AddTeacherDto,
  ) {
    return this.groupsService.addTeacherForSubject(+groupId, addTeacherDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Teacher)
  @Post(':id/grade')
  gradeStudentForSubject(
    @CurrentUser('id') teacherId: number,
    @Param() groupId: string,
    gradeStudentForSubjectDto: GradeStudentForSubjectDto,
  ) {
    return this.groupsService.gradeStudentForSubject(
      +groupId,
      gradeStudentForSubjectDto,
      teacherId,
    );
  }

  @Get(':groupId/subjects/:subjectId/average')
  getAverageGradeForSpecificGroupAndSubject(
    @Param('groupId') groupId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.groupsService.getAverageGradeForGivenGroupAndSubject(
      +groupId,
      +subjectId,
    );
  }
}

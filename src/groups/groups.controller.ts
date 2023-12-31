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
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('groups')
@ApiCookieAuth('auth-cookie')
@ApiUnauthorizedResponse({
  description:
    'When access token is invalid or expired returns Unauthorized error',
})
@ApiForbiddenResponse({
  description: 'Return Forbidden error when student or teacher tries to access',
})
@UseGuards(JwtAccessGuard)
@UseGuards(RolesGuard)
@Roles(UserRole.Director)
@Controller({ path: 'groups', version: '1' })
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Create a group as a director' })
  @ApiCreatedResponse({
    description: 'Upon successfull request returns created group',
  })
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Director)
  @ApiOperation({ summary: 'Get all groups as a director' })
  @ApiOkResponse({ description: 'Returns a list of groups' })
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @ApiOperation({ summary: 'Get a group with id' })
  @ApiFoundResponse({
    description: 'Returns a group object without its relations',
  })
  @ApiNotFoundResponse({
    description: 'Returns a Notfound error when group with given it not found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a group as a director' })
  @ApiOkResponse({ description: 'Returns updated group' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @ApiOperation({ summary: 'Delete a group as a director' })
  @ApiNoContentResponse({
    description: 'Returns no content response when successfull',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }

  @ApiOperation({ summary: 'Add multiple students to a group as a director' })
  @ApiCreatedResponse({ description: 'Returns group with added students' })
  @ApiNotFoundResponse({
    description: 'Returns Notfund error when any of the students not found',
  })
  @ApiBadRequestResponse({
    description:
      'Returns BadRequest error when any of the given students are not students',
  })
  @Post(':id/addStudents')
  addStudentsToAGroup(
    @Param('id') groupId: string,
    @Body() addStudentsDto: AddEntitiesDto,
  ) {
    return this.groupsService.addStudents(+groupId, addStudentsDto.entityIds);
  }

  @ApiOperation({ summary: 'Add subjects to group as a director' })
  @ApiCreatedResponse({ description: 'Returns group with added subjects' })
  @ApiNotFoundResponse({
    description: 'Returns NotFound error when group is not found',
  })
  @Post(':id/addSubjects')
  addSubjectsToAGroup(
    @Param('id') groupId: string,
    @Body() addSubjectsDto: AddEntitiesDto,
  ) {
    return this.groupsService.addSubjects(+groupId, addSubjectsDto.entityIds);
  }

  @ApiOperation({
    summary: 'Add teacher for a given group with id and subject',
  })
  @ApiCreatedResponse({ description: 'Returns group with added subject' })
  @ApiNotFoundResponse({
    description: 'Returns NotFound error when group is not found',
  })
  @Post(':id/addTeacherForSubject')
  addTeacherForSubject(
    @Param('id') groupId: string,
    @Body() addTeacherDto: AddTeacherDto,
  ) {
    return this.groupsService.addTeacherForSubject(+groupId, addTeacherDto);
  }

  @ApiOperation({ summary: 'Grade a student in a group as teacher' })
  @ApiCreatedResponse({ description: 'Returns created student grade entity' })
  @ApiForbiddenResponse({
    description:
      'Returns Forbidden error when student or director tries to access',
  })
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

  @ApiOperation({
    summary:
      'Get average grade of a group from a particular subject as a director',
  })
  @ApiOkResponse({
    description: 'Returns average grade for give group and subject',
  })
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

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
  ApiConflictResponse,
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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddEntitiesDto } from 'src/common/entities/add-entities.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';

@ApiTags('users')
@ApiCookieAuth('auth-cookie')
@ApiUnauthorizedResponse({
  description: 'Returns Unauthorized error if not logged in',
})
@ApiForbiddenResponse({
  description:
    'Returns Forbidden error when student or teacher tries to access',
})
@UseGuards(JwtAccessGuard)
@UseGuards(RolesGuard)
@Roles(UserRole.Director)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create a student or a teacher user after signin in as a director',
  })
  @ApiCreatedResponse({ description: 'Returns created user' })
  @ApiConflictResponse({
    description:
      'Returns Conflict error when user with the same phone number already exists',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Find all users as a director' })
  @ApiOkResponse({ description: 'Returns list of users' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Find a user with id as a director' })
  @ApiFoundResponse({ description: 'Returns user when found' })
  @ApiNotFoundResponse({ description: 'Returns NotFound error when not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a user with id as a director' })
  @ApiOkResponse({ description: 'Returns updated user' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user with id as a director' })
  @ApiNoContentResponse({
    description: 'Returns no content response when found',
  })
  @ApiNotFoundResponse({ description: 'Returns NotFound error when not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @ApiOperation({ summary: 'Add subjects to a teacher as a director' })
  @Post(':id/addSubjectsToTeacher')
  addSubjectsToTeacher(
    @Param('id') teacherId: number,
    @Body() addsubjectsDto: AddEntitiesDto,
  ) {
    return this.usersService.addSubjectsToTeacher(
      +teacherId,
      addsubjectsDto.entityIds,
    );
  }

  @ApiOperation({ summary: 'Get average grade of a student' })
  @ApiOkResponse({
    description: 'Returns average grade from all subjects for a given student',
  })
  @ApiNotFoundResponse({
    description: 'Returns NotFound error when student is not found',
  })
  @Get(':id/averageGrade')
  getAverageGradeOfStudent(@Param(':id') studentId: string) {
    return this.usersService.getAverageGrade(+studentId);
  }
}

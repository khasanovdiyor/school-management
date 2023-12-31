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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddEntitiesDto } from 'src/common/entities/add-entities.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';

@UseGuards(JwtAccessGuard)
@UseGuards(RolesGuard)
@Roles(UserRole.Director)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

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

  @Get(':id/averageGrade')
  getAverageGradeOfStudent(@Param(':id') studentId: string) {
    return this.usersService.getAverageGrade(+studentId);
  }
}

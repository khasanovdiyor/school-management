import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { UserRole } from 'src/users/enums/user-role.enum';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('subjects')
@ApiCookieAuth('auth-cookie')
@ApiUnauthorizedResponse({
  description: 'Returns Unauthorized error when not logged in',
})
@ApiForbiddenResponse({
  description:
    'Returns Forbidden error when student or teacher tries to access',
})
@UseGuards(RolesGuard)
@Roles(UserRole.Director)
@UseGuards(JwtAccessGuard)
@Controller({ path: 'subjects', version: '1' })
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ summary: 'Create a subject as a director' })
  @ApiCreatedResponse({ description: 'Returns created subject' })
  @ApiConflictResponse({
    description:
      'Returns Conflict error when subject with the same name already exists',
  })
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @ApiOperation({ summary: 'Get all subjects as a director' })
  @ApiOkResponse({ description: 'Returns list of subjects' })
  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @ApiOperation({ summary: 'Get a group with id as a director' })
  @ApiFoundResponse({ description: 'Returns subject when found' })
  @ApiNotFoundResponse({ description: 'Returns NotFound error when not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a group with id as a director' })
  @ApiOkResponse({ description: 'Returns updated subject' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @ApiOperation({ summary: 'Remove a group with id as a director' })
  @ApiNoContentResponse({
    description: 'Returns no-content response when found',
  })
  @ApiNotFoundResponse({ description: 'Returns NotFound error when not found' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }
}

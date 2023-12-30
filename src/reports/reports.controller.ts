import { Controller, Get, Param } from '@nestjs/common';

import { ReportsService } from './reports.service';

@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('groups/:groupId/subjects/:subjectId/average')
  getAverageGradeForSpecificGroupAndSubject(
    @Param('groupId') groupId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.reportsService.getAverageGradeForGivenGroupAndSubject(
      +groupId,
      +subjectId,
    );
  }
}

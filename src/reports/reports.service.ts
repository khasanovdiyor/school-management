import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  constructor() {}

  getAverageGradeForGivenGroupAndSubject(groupId: number, subjectId: number) {
    return 'grade';
  }
}

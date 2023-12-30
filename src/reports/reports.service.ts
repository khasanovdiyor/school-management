import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  constructor() {}

  getAverageGradeForGivenGroupAndSubject(groupId: number, subjectId: number) {
    console.log(groupId, subjectId);
    return 'grade';
  }
}

import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { User } from 'src/users/entities/user.entity';

import { Group } from './group.entity';

@Unique('uniq-group-teacher-subject', ['group', 'teacher', 'subject'])
@Entity()
export class GroupTeacherSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.teacherSubjects, {
    cascade: ['remove'],
  })
  teacher: User;

  @ManyToOne(() => Subject, { cascade: ['remove'] })
  subject: Subject;

  @ManyToOne(() => Group, { cascade: ['remove'] })
  group: Group;
}

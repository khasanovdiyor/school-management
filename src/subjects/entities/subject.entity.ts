import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { StudentGrade } from 'src/users/entities/student-grade.entity';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Subject extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => StudentGrade, (studentGrade) => studentGrade.subject)
  studentGrades: StudentGrade[];

  @ManyToMany(() => User, (teacher) => teacher.teacherSubjects)
  teachers: User[];

  @ManyToMany(() => Group, (group) => group.subjects)
  groups: Group[];
}

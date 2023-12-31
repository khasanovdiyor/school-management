import { Column, Entity, ManyToMany, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { StudentGrade } from 'src/users/entities/student-grade.entity';
import { Group } from 'src/groups/entities/group.entity';

@Entity()
export class Subject extends BaseEntity {
  @Unique(['name'])
  @Column()
  name: string;

  @OneToMany(() => StudentGrade, (studentGrade) => studentGrade.subject)
  studentGrades: StudentGrade[];

  @ManyToMany(() => Group)
  groups: Group[];
}

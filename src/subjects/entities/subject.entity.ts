import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Subject extends BaseEntity {
  @Unique(['name'])
  @Column()
  name: string;
}

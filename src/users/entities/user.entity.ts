import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';

import { UserRole } from '../enums/user-role.enum';

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Unique(['password'])
  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ select: false })
  password: string;
}

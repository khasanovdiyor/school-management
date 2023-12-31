import { IsNumber } from 'class-validator';

export class AddEntitiesDto {
  @IsNumber({}, { each: true })
  entityIds: number[];
}

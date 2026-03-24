import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlairEntity } from './flair.entity';

@Entity({ name: 'log' })
export class LogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  flairId: string;

  @ManyToOne(() => FlairEntity, (flair) => flair.logs, { onDelete: 'CASCADE' })
  flair: FlairEntity;

  @Column()
  message: string;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}

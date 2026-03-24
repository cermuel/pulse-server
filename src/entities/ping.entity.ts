import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PulseEntity } from './pulse.entity';

@Entity({ name: 'ping' })
export class PingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pulseId: string;

  @ManyToOne(() => PulseEntity, (pulse) => pulse.pings, { onDelete: 'CASCADE' })
  pulse: PulseEntity;

  @Column({ nullable: true })
  statusCode: number;

  @Column()
  isUp: boolean;

  @Column()
  responseTime: number;

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;
}

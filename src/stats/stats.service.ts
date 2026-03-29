import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FlairEntity } from 'src/entities/flair.entity';
import { LogEntity } from 'src/entities/log.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { UserEntity } from 'src/entities/user.entity';
import {
  calculateAverageUptime,
  calculateDailyUptime,
  filterByDays,
  filterByHours,
} from 'src/utils/helpers';
import { Between, Like, Not, Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(PulseEntity)
    private readonly pulseRepo: Repository<PulseEntity>,
    @InjectRepository(PingEntity)
    private readonly pingRepo: Repository<PingEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(LogEntity)
    private readonly logRepo: Repository<LogEntity>,
  ) {}

  async getUserServicesStats(shortHandorEmail: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: shortHandorEmail }, { shortHand: shortHandorEmail }],
    });
    if (!user) throw new NotFoundException('User not found');

    let startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    let endDate = new Date();

    const pulses = await this.pulseRepo
      .createQueryBuilder('pulse')
      .leftJoinAndSelect(
        'pulse.pings',
        'ping',
        'ping.createdAt >= :startDate',
        { startDate },
      )
      .where('pulse.userId = :userId', { userId: user.id })
      .select([
        'pulse.url',
        'pulse.name',
        'pulse.publicId',
        'pulse.isActive',
        'pulse.interval',
        'pulse.lastCheckedAt',
        'pulse.expectedStatus',
        'ping.isUp',
        'ping.createdAt',
      ])
      .getMany();

    const pulsesStat = pulses.map((p) => {
      const recentPings = p.pings.filter(
        (ping: any) => new Date(ping.createdAt) >= startDate,
      );
      return {
        ...p,
        dailyUptime: calculateDailyUptime(recentPings),
        overallUptime: calculateAverageUptime(recentPings),
      };
    });

    return {
      message: 'Pulses stats fetched successfully',
      pulses: pulsesStat,
    };
  }

  async getServiceStats(shortHandorEmail: string, publicId: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: shortHandorEmail }, { shortHand: shortHandorEmail }],
    });
    if (!user) throw new NotFoundException('User not found');
    const pulse = await this.pulseRepo.findOne({
      where: { publicId, userId: user.id },
    });

    if (!pulse) throw new NotFoundException('Pulse not found');

    const endDate = new Date();
    const last28DaysStart = new Date(
      endDate.getTime() - 28 * 24 * 60 * 60 * 1000,
    );

    const pings = await this.pingRepo.find({
      where: {
        pulseId: pulse.id,
        createdAt: Between(last28DaysStart, endDate),
      },
      order: { createdAt: 'DESC' },
    });

    const mapIsUp = (items: typeof pings) => {
      return items.map((item) => ({ isUp: item.isUp }));
    };

    const responseTimes = filterByDays(pings, 2, endDate);

    const last4HoursUptime = mapIsUp(filterByHours(pings, 4, endDate));
    const last24HoursUptime = mapIsUp(filterByHours(pings, 24, endDate));
    const lastWeekUptime = mapIsUp(filterByDays(pings, 7, endDate));
    const lastMonthUptime = mapIsUp(pings);

    const recentLogs = await this.logRepo.find({
      where: {
        flair: { pulseId: pulse.id },
        type: Not('email-sent'),
      },
      take: 10,
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Pulse stats fetched successfully',
      pulses: {
        pulse,
        pings,
        responseTimes,
        last4HoursUptime,
        last24HoursUptime,
        lastWeekUptime,
        lastMonthUptime,
        recentLogs,
      },
    };
  }
}

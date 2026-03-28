import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FlairService } from 'src/flair/flair.service';
import { PingService } from 'src/ping/ping.service';

@Processor('check-pulse', { concurrency: 10 })
export class PulseWorker extends WorkerHost {
  constructor(
    private readonly pingService: PingService,
    private readonly flairService: FlairService,
  ) {
    super();
  }
  async process(job: Job<{ pulseId: string }>) {
    try {
      await this.pingService.create(job.data.pulseId);
    } catch (err) {
      console.error('Worker process error:', err);
      throw err;
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<{ pulseId: string }>) {
    console.log(`Pulse with id: ${job.data.pulseId} started pinging`);
  }

  @OnWorkerEvent('completed')
  async onComplete(job: Job<{ pulseId: string }>) {
    console.log(
      `Pulse with id: ${job.data.pulseId} completed ping round with success`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ pulseId: string }>, err: Error) {
    console.log(`Pulse with id: ${job.data.pulseId} failed`);
    console.error(err);
  }
}

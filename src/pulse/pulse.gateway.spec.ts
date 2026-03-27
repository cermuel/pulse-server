import { Test, TestingModule } from '@nestjs/testing';
import { PulseGateway } from './pulse.gateway';

describe('PulseGateway', () => {
  let gateway: PulseGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PulseGateway],
    }).compile();

    gateway = module.get<PulseGateway>(PulseGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

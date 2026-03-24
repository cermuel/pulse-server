import { Test, TestingModule } from '@nestjs/testing';
import { FlairService } from './flair.service';

describe('FlairService', () => {
  let service: FlairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlairService],
    }).compile();

    service = module.get<FlairService>(FlairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

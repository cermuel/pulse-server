import { Test, TestingModule } from '@nestjs/testing';
import { FlairController } from './flair.controller';

describe('FlairController', () => {
  let controller: FlairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlairController],
    }).compile();

    controller = module.get<FlairController>(FlairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

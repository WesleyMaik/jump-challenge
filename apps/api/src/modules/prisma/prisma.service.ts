import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}

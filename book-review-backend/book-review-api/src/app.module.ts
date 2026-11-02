import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthController } from './health.controller';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [HealthController, UploadsController],
  imports: [PrismaModule, BooksModule, ReviewsModule],
})
export class AppModule {}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // Step 3: post a review for a specific book
  async create(bookId: number, dto: CreateReviewDto) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Book #${bookId} not found`);

    return this.prisma.review.create({
      data: { rating: dto.rating, content: dto.content, bookId },
    });
  }

  async findByBook(bookId: number) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Book #${bookId} not found`);

    return this.prisma.review.findMany({
      where: { bookId },
      orderBy: { id: 'asc' },
    });
  }

  async update(bookId: number, reviewId: number, dto: UpdateReviewDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const result = await this.prisma.review.updateMany({
      where: { id: reviewId, bookId },
      data: dto,
    });
    if (result.count === 0) {
      throw new NotFoundException(`Review #${reviewId} not found`);
    }

    return this.prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
  }

  async remove(bookId: number, reviewId: number) {
    const result = await this.prisma.review.deleteMany({
      where: { id: reviewId, bookId },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Review #${reviewId} not found`);
    }

    return { deleted: true, id: reviewId };
  }
}

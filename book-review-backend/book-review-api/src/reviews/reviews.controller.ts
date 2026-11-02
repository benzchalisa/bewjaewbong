import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('books/:bookId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(bookId, dto);
  }

  @Get()
  findByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.reviewsService.findByBook(bookId);
  }

  @Patch(':reviewId')
  update(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(bookId, reviewId, dto);
  }

  @Delete(':reviewId')
  remove(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return this.reviewsService.remove(bookId, reviewId);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        coverUrl: dto.coverUrl,
        ...(dto.publishedAt && { publishedAt: new Date(dto.publishedAt) }),
      },
      include: { reviews: true },
    });
  }

  // Step 4: Data Retrieval - books with nested list of reviews
  findAll() {
    return this.prisma.book.findMany({
      include: { reviews: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { reviews: true },
    });
    if (!book) throw new NotFoundException(`Book #${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }
    await this.findOne(id);
    return this.prisma.book.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.publishedAt && { publishedAt: new Date(dto.publishedAt) }),
      },
      include: { reviews: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}

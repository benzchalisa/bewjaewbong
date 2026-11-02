import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { createReadStream, mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { diskStorage } from 'multer';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const UPLOAD_DIRECTORY = resolve(
  process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'),
);

mkdirSync(UPLOAD_DIRECTORY, { recursive: true });

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}

@Controller()
export class UploadsController {
  @Post('books/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!MIME_EXTENSIONS[file.mimetype]) {
          callback(new BadRequestException('Only JPG, PNG, and WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: UPLOAD_DIRECTORY,
        filename: (_request, file, callback) => {
          callback(null, `${randomUUID()}${MIME_EXTENSIONS[file.mimetype]}`);
        },
      }),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('An image file is required');
    }

    const publicUrl = (process.env.API_PUBLIC_URL ?? 'http://localhost:3000')
      .replace(/\/+$/, '');
    return { url: `${publicUrl}/uploads/${file.filename}` };
  }

  @Get('uploads/:filename')
  async getUpload(@Param('filename') filename: string) {
    if (!/^[\da-f-]{36}\.(jpg|png|webp)$/.test(filename)) {
      throw new NotFoundException('Image not found');
    }

    const filePath = join(UPLOAD_DIRECTORY, filename);
    try {
      await stat(filePath);
    } catch (error) {
      if (isMissingFile(error)) {
        throw new NotFoundException('Image not found');
      }
      throw error;
    }

    const mimeType = Object.entries(MIME_EXTENSIONS).find(
      ([, extension]) => extension === extname(filename),
    )?.[0];
    if (!mimeType) {
      throw new NotFoundException('Image not found');
    }

    return new StreamableFile(createReadStream(filePath), {
      type: mimeType,
    });
  }
}

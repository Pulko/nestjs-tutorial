import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(id: number, userId: number) {
    return (
      this.prisma.bookmark.findFirst({
        where: {
          id,
          userId,
        },
      }) || []
    );
  }

  async createBookmark(userId: number, dto: any) {
    return await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async editBookmarkById(
    id: number,
    userId: number,
    dto: any,
  ) {
    const bookmark =
      await this.prisma.bookmark.findFirst({
        where: { id, userId },
      });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    return this.prisma.bookmark.update({
      where: {
        id,
      },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(
    id: number,
    userId: number,
  ) {
    const bookmark =
      await this.prisma.bookmark.findFirst({
        where: { id, userId },
      });

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    await this.prisma.bookmark.delete({
      where: {
        id,
      },
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private service: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.service.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.getBookmarkById(
      id,
      userId,
    );
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.service.createBookmark(
      userId,
      dto,
    );
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.editBookmarkById(
      id,
      userId,
      dto,
    );
  }

  @HttpCode(204)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.deleteBookmarkById(
      id,
      userId,
    );
  }
}

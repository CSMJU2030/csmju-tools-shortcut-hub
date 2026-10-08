import { Controller, Get, Param, Post, Body, Query, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { QuickLinksService } from './quick-links.service';
import { Public } from '../auth/decorators/public.decorator';
import { FindQuickLinksDto } from './dto/find-quick-links.dto';
import { CreateQuickLinkDto } from './dto/create-quick-link.dto';
import { UpdateQuickLinkDto } from './dto/update-quick-link.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../auth/permissions';
import { buildPaginationMeta } from '../common/dto/pagination.dto';
import { CollectionResult } from '../common/api-response';

@Controller('v1/quick-links')
export class QuickLinksController {
  constructor(private readonly quickLinksService: QuickLinksService) {}

  @Get()
  @Public()
  async findAll(@Query() query: FindQuickLinksDto) {
    const { data, total } = await this.quickLinksService.findAll(query);
    return new CollectionResult(
      data,
      buildPaginationMeta(total, query.page || 1, query.limit || 20),
    );
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quickLinksService.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.QUICK_LINK_MANAGE)
  create(@Body() createDto: CreateQuickLinkDto) {
    return this.quickLinksService.create(createDto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.QUICK_LINK_MANAGE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateQuickLinkDto) {
    return this.quickLinksService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.QUICK_LINK_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quickLinksService.remove(id);
  }


  @Post(':id/click')
  trackClick(@Param('id', ParseUUIDPipe) id: string) {
    return this.quickLinksService.trackClick(id);
  }
}

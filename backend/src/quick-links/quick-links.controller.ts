import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { QuickLinksService } from './quick-links.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('quick-links')
export class QuickLinksController {
  constructor(private readonly quickLinksService: QuickLinksService) {}

  @Get()
  @Public()
  findAll(@Query() query: any) {
    return this.quickLinksService.findAll(query);
  }

  @Post(':id/click')
  @Public()
  trackClick(@Param('id') id: string) {
    return this.quickLinksService.trackClick(id);
  }
}

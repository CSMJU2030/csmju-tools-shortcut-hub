import { Module } from '@nestjs/common';
import { QuickLinksService } from './quick-links.service';
import { QuickLinksController } from './quick-links.controller';

@Module({
  controllers: [QuickLinksController],
  providers: [QuickLinksService],
})
export class QuickLinksModule {}

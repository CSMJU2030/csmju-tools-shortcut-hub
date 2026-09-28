import { PartialType } from '@nestjs/mapped-types';
import { CreateQuickLinkDto } from './create-quick-link.dto';

export class UpdateQuickLinkDto extends PartialType(CreateQuickLinkDto) {}

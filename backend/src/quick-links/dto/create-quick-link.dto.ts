import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { LinkCategory, TargetYear } from '../../../generated/prisma/client';

export class CreateQuickLinkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsEnum(LinkCategory)
  category?: LinkCategory;

  @IsOptional()
  @IsArray()
  @IsEnum(TargetYear, { each: true })
  targetYears?: TargetYear[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

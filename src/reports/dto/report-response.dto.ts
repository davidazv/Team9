import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  status_id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  incident_date?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  evidence_url?: string;

  @ApiProperty({ required: false })
  assigned_admin_id?: number;

  @ApiProperty()
  is_anonymous: boolean;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}
import { IsBoolean, IsString } from "class-validator";

export class CreateDashboardAppDto {
  @IsString()
  id?: string;

  @IsString()
  name: string;
  
  @IsString()
  friendly_name?: string;
  
  @IsString()
  url: string;

  @IsString()
  full_url: string;
  
  @IsString()
  port?: number;
  
  @IsString()
  token?: string;
}

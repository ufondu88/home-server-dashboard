import { IsString } from "class-validator";

export class CreateIntegrationDto {
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  username?: string;

  @IsString()
  password?: string;

  @IsString()
  internal_address?: string;

  @IsString()
  icon?: string;

  @IsString()
  extetnal_ip?: string;

  @IsString()
  full_url: string;

  @IsString()
  port?: number;

  @IsString()
  type?: string;

  auth: any

  cookie?: { ticket: string, CSRFPreventionToken: string, timestamp: number }

  isAlive: boolean
}

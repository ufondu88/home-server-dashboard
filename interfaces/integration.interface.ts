export interface Integration {
  id?: string;
  name: string;
  username: string;
  password: string;
  internal_address: string;
  external_address: string;
  icon?: string;
  port?: number;
  full_url?: string;
  type?: string
  isAlive?: boolean;
}
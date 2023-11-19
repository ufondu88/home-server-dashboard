import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import * as ping from 'ping'

@Injectable()
export class IntegrationService {
  private logger = new Logger('dashboard-service')

  private readonly dataDir = '/data';
  private readonly dashboardDataDir = '/data/dashboard-apps';

  async create(integration: CreateIntegrationDto) {
    // Create the data directories if they don't exist
    mkdirp.sync(this.dataDir);
    mkdirp.sync(this.dashboardDataDir);

    // Use global crypto property to create random ID
    const id = crypto.randomUUID()

    integration.id = id
    integration.full_url = this.fullUrl(integration) || ""

    this.createAuthFile(integration)

    const currentApps = await this.findAll()

    currentApps.push(integration)

    await this.overwriteData(currentApps)

    return {
      message: `${integration.name} successfully created`
    };
  }

  private async createAuthFile(integration: CreateIntegrationDto) {
    const relevantDir = `${this.dashboardDataDir}/${integration.id}`

    mkdirp.sync(relevantDir);

    if (integration.type && integration.type == "proxmox") {
      const { username, password } = integration

      if (username && password) {
        // encode the strings in base64
        integration.auth = {
          username: btoa(username),
          password: btoa(password)
        }

        delete integration.username
        delete integration.password
      }
      integration.cookie = {} as { ticket: string, CSRFPreventionToken: string, timestamp: number }
    }
  }

  async findAll(): Promise<Omit<CreateIntegrationDto, 'username' | 'password' | 'auth' | 'cookie'>[]> {
    const filePath = path.join(this.dashboardDataDir, 'apps.json');

    try {
      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // If it exists, read and parse the JSON data
        const rawData = await fs.readFile(filePath, 'utf8');
        const allApps = JSON.parse(rawData) as CreateIntegrationDto[]

        for (const app of allApps) {
          const response = await ping.promise.probe(app.internal_address || "")

          app.isAlive = response.alive
          delete app.auth
          delete app.cookie
        }

        return allApps as Omit<CreateIntegrationDto, 'username' | 'password' | 'auth' | 'cookie'>[];
      } else {
        // If it doesn't exist, create an empty array and save it to the file
        const emptyData: any[] = [];
        await fs.writeJSON(filePath, emptyData);
        return emptyData;
      }
    } catch (error) {
      this.logger.error('Error reading or creating the JSON file:', error);
      throw error;
    }
  }

  private async overwriteData(newData: any): Promise<void> {
    const filePath = path.join(this.dashboardDataDir, 'apps.json');

    try {
      await fs.writeJSON(filePath, newData);
    } catch (error) {
      this.logger.error('Error overwriting JSON file:', error);
      throw error;
    }
  }

  private fullUrl(createIntegrationDto: CreateIntegrationDto) {
    const url = createIntegrationDto.internal_address
    const port = createIntegrationDto.port

    if (this.isHttpAddress(url || "")) {
      return url;
    }

    if (this.isIpAddress(url || "")) {
      return `http://${url}:${port}`
    }

    return url
  }

  private isHttpAddress(input: string) {
    // Regular expression for matching HTTP or HTTPS URLs
    const httpRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/\S*)?$/;

    return httpRegex.test(input);
  }

  private isIpAddress(input: string) {
    // Regular expression for matching IPv4 address
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return ipRegex.test(input);
  }

  findOne(id: number) {
    return `This action returns a #${id} integration`;
  }

  update(id: number, updateIntegrationDto: UpdateIntegrationDto) {
    return `This action updates a #${id} integration`;
  }

  remove(id: number) {
    return `This action removes a #${id} integration`;
  }
}

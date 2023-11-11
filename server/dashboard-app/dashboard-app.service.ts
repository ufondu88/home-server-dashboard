import { Injectable, Logger } from '@nestjs/common';
import { CreateDashboardAppDto } from './dto/create-dashboard-app.dto';
import { UpdateDashboardAppDto } from './dto/update-dashboard-app.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

@Injectable()
export class DashboardAppService {
  private logger = new Logger('dashboard-service')

  private readonly dataDir = '/data';
  private readonly dashboardDataDir = '/data/dashboard-apps';

  async create(createDashboardAppDto: CreateDashboardAppDto) {
    // Create the data directories if they don't exist
    mkdirp.sync(this.dataDir);
    mkdirp.sync(this.dashboardDataDir);

    // Use global crypto property to create random ID
    const id = crypto.randomUUID()

    createDashboardAppDto.id = id
    createDashboardAppDto.full_url = this.fullUrl(createDashboardAppDto)

    const currentApps = await this.findAll()

    currentApps.push(createDashboardAppDto)

    await this.overwriteData(currentApps)

    return {
      message: `${createDashboardAppDto.name} successfully created`
    };
  }

  async findAll(): Promise<CreateDashboardAppDto[]> {
    const filePath = path.join(this.dashboardDataDir, 'apps.json');

    try {
      // Check if the file exists
      if (fs.existsSync(filePath)) {
        // If it exists, read and parse the JSON data
        const rawData = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(rawData);
        return jsonData;
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

  private fullUrl(createDashboardAppDto: CreateDashboardAppDto) {
    const url = createDashboardAppDto.url
    const port = createDashboardAppDto.port

    if (this.isHttpAddress(url)) {
      return url;
    }

    if (this.isIpAddress(url)) {
      return `${url}:${port}`
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
    return `This action returns a #${id} dashboardApp`;
  }

  update(id: number, updateDashboardAppDto: UpdateDashboardAppDto) {
    return `This action updates a #${id} dashboardApp`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboardApp`;
  }
}

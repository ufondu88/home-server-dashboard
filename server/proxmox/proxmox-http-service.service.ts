import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { APPS_FILE, DASHBOARD_DATA_DIR, DATA_DIR, EXPIRATION_TIME } from '../constants';
import { CreateIntegrationDto } from 'server/integration/dto/create-integration.dto';

@Injectable()
export class ProxmoxHttpService {
  private logger = new Logger('ProxmoxHttpService')

  private domain = "http://192.168.86.53:8006/api2/json"

  private config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Disables SSL certificate verification (use with caution)
    }),
  };

  constructor(private httpService: HttpService) { }

  request(method: string, url: string, id: string, data?: any) {
    return this.renewProxmoxCredsIfExpired(id).pipe(
      switchMap(res => {
        return this.httpService.request({
          method,
          url,
          data,
          headers: res.headers,
          httpsAgent: res.httpsAgent
        })
      })
    ).pipe(
      map(res => res['data']['data']),
      catchError(res => {
        throw new Error(res.message);
      }),
    );
  }

  private renewProxmoxCredsIfExpired(id: string) {
    const cookie = this.getLocalProxmoxCookie(id);

    const { ticket, CSRFPreventionToken, timestamp } = cookie;

    if (!ticket || !CSRFPreventionToken || !timestamp) {
      this.logger.log('No cookie information. Getting cookie from the server');

      return this.getProxmoxCredsFromServer(id)
    }

    this.logger.log('Cookies! Yum')

    if (Date.now() >= timestamp + EXPIRATION_TIME) {
      this.logger.log('Cookie expired. Renewing cookie from the server');

      return this.getProxmoxCredsFromServer(id);
    }

    return of({
      headers: {
        Cookie: `PVEAuthCookie=${ticket}`,
        CSRFPreventionToken: CSRFPreventionToken,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
  }

  private getLocalProxmox(id: string) {
    const ALL_APPS: CreateIntegrationDto[] = this.readJSONFile(APPS_FILE)

    const proxmox = ALL_APPS.find(app => app.id == id)

    return proxmox
  }

  private getLocalProxmoxCookie(id: string): { ticket: string, CSRFPreventionToken: string, timestamp: number } {
    const proxmox = this.getLocalProxmox(id)

    return proxmox && proxmox.cookie ? proxmox.cookie : {} as { ticket: string, CSRFPreventionToken: string, timestamp: number }
  }

  private updateLocalProxmox(id: string, data: any) {
    const ALL_APPS: any[] = this.readJSONFile(APPS_FILE)

    for (const app of ALL_APPS) {
      if (app.id == id) {
        app.cookie = data
      }
    }

    this.overwriteFile(APPS_FILE, ALL_APPS)
  }

  private readJSONFile(file: string) {
    // Create the data directories if they don't exist
    mkdirp.sync(DATA_DIR);
    mkdirp.sync(DASHBOARD_DATA_DIR);

    const filePath = path.join(DASHBOARD_DATA_DIR, file);

    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      return jsonData;
    } catch (error) {
      this.logger.error(`Error reading or creating the JSON file ${file}:`, error);
      throw error;
    }
  }

  private getUserCreds(id: string): { username: string, password: string } {
    this.logger.log('Getting user credentials')

    const proxmox = this.getLocalProxmox(id) || {} as CreateIntegrationDto 

    return proxmox.auth
  }

  private overwriteFile(file: string, newData: any): void {
    this.logger.log(`Writing to ${file}`)

    const filePath = path.join(DASHBOARD_DATA_DIR, file);

    try {
      fs.writeJSONSync(filePath, newData);
    } catch (error) {
      this.logger.error('Error overwriting JSON file:', error);
      throw error;
    }
  }

  private getProxmoxCredsFromServer(id: string) {
    const { username, password } = this.getUserCreds(id);
    const params = new URLSearchParams();

    // Decode the base64 strings
    params.append('username', atob(username));
    params.append('password', atob(password));

    return this.httpService
      .post(`${this.domain}/access/ticket`, params.toString(), this.config)
      .pipe(
        map(res => res.data.data),
        tap(res => {
          this.logger.log('Credentials renewed from the server successfully!');

          const ticket = res['ticket'];
          const CSRFPreventionToken = res['CSRFPreventionToken'];
          const timestamp = Date.now();

          const cookieData = { ticket, CSRFPreventionToken, timestamp };

          this.updateLocalProxmox(id, cookieData);
        }),
        map(res => {
          return {
            headers: {
              Cookie: `PVEAuthCookie=${res['ticket']}`,
              CSRFPreventionToken: res['CSRFPreventionToken'],
            },
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          }
        })
      )
  }
}
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, map, of, tap } from 'rxjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as https from 'https'
import { APPS_FILE, DASHBOARD_DATA_DIR, DATA_DIR, TWO_HOURS } from 'server/constants';

@Injectable()
export class ProxmoxHttpService {
  private logger = new Logger('ProxmoxHttpService')

  domain = "https://192.168.86.53:8006/api2/json"
  cookieTimestamp = 0;
  proxmoxHeaders: any;
  proxmoxCookie: string;
  proxmoxToken: string;

  config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Disables SSL certificate verification (use with caution)
    })
  };

  constructor(private httpService: HttpService) { }

  request(method: string, url: string, id: string, object?: any) {
    this.renewProxmoxCredsIfExpired(id)

    switch (method.toLowerCase()) {
      case 'get':
        return this.httpService.get(url, this.proxmoxHeaders).pipe(
          map(res => res['data']['data']),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      case 'put':
        return this.httpService.put(url, object, this.proxmoxHeaders).pipe(
          map(res => res['data']['data']),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      case 'post':
        return this.httpService.post(url, object, this.proxmoxHeaders).pipe(
          map(res => res['data']['data']),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      case 'delete':
        return this.httpService.delete(url, this.proxmoxHeaders).pipe(
          map(res => res['data']['data']),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      default:
        return
    }
  }

  private renewProxmoxCredsIfExpired(id: string) {
    const cookie = this.getLocalProxmoxCookie(id)

    const { ticket, CSRFPreventionToken, timestamp } = cookie


    if (!ticket || !CSRFPreventionToken || !timestamp) {
      this.logger.log('No cookie information. Getting cookie from server')
      this.getProxmoxCredsFromServer(id)
    } else {
      this.proxmoxCookie = cookie['ticket']
      this.proxmoxToken = cookie['CSRFPreventionToken']
      this.cookieTimestamp = cookie['timestamp']
    }

    this.proxmoxHeaders = {
      headers: {
        Cookie: `PVEAuthCookie=${this.proxmoxCookie}`,
        CSRFPreventionToken: this.proxmoxToken
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    };

    if (Date.now() >= this.cookieTimestamp + TWO_HOURS) {
      this.logger.log('Cookie expired. Renewing cookie from server')
      this.getProxmoxCredsFromServer(id)
    }
  }

  private getLocalProxmox(id: string) {
    const ALL_APPS: any[] = this.readJSONFile(APPS_FILE)

    const proxmox = ALL_APPS.filter(app => app.id == id)[0]

    return proxmox
  }

  private getLocalProxmoxCookie(id: string) {
    const proxmox = this.getLocalProxmox(id)

    return proxmox.cookie as { ticket: string, CSRFPreventionToken: string, timestamp: number }
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

    const proxmox = this.getLocalProxmox(id)

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
    const { username, password } = this.getUserCreds(id)
    const params = new URLSearchParams();

    // decode the base64 strings
    params.append('username', atob(username));
    params.append('password', atob(password));

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Disables SSL certificate verification (use with caution)
      })
    };

    this.httpService.post(`${this.domain}/access/ticket`, params.toString(), config).pipe(
      tap(res => {
        this.logger.log('Credentials renewd from server successfully!')

        this.proxmoxCookie = res.data['data']['ticket']
        this.proxmoxToken = res.data['data']['CSRFPreventionToken']
        this.cookieTimestamp = Date.now()

        const cookieData = {
          ticket: this.proxmoxCookie,
          CSRFPreventionToken: this.proxmoxToken,
          timestamp: this.cookieTimestamp
        }

        this.updateLocalProxmox(id, cookieData)

        this.proxmoxHeaders = {
          headers: {
            Cookie: `PVEAuthCookie=${this.proxmoxCookie}`
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        };
      })
    ).subscribe()
  }

  apiHeaders() {
    const apiHeaders = { "X-Api-Key": process.env['OPS_INSIGHT_AWS_API_KEY'] || "" }
    return { headers: apiHeaders }
  }
}
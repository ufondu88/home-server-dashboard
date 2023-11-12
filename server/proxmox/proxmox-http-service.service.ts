import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, map, of, tap } from 'rxjs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as https from 'https'

const TWO_HOURS = 60 * 60 * 1000 * 2
const AUTH_FILE = 'auth.json'
const COOKIE_FILE = 'cookie.json'

@Injectable()
export class ProxmoxHttpService {
  private logger = new Logger('ProxmoxHttpService')

  private readonly dataDir = '/data';
  private readonly dashboardDataDir = '/data/dashboard-apps';

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

  request(method: string, url: string, object?: any) {
    this.renewProxmoxCredsIfExpired()

    switch (method.toLowerCase()) {
      case 'get':
        return this.httpService.get(url, this.proxmoxHeaders).pipe(
          map(res => res['data']['data']),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      case 'put':
        return this.httpService.put(url, object, this.proxmoxHeaders).pipe(
          map(res => res.data),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      case 'post':
        return this.httpService.post(url, object, this.proxmoxHeaders).pipe(
          map(res => res.data)
        )
      case 'delete':
        return this.httpService.delete(url, this.proxmoxHeaders).pipe(
          map(res => res.data),
          catchError(res => of({ "message": res.message, "status": res.status }))
        )
      default:
        return
    }
  }

  private readJSONFile(file: string) {
    // Create the data directories if they don't exist
    mkdirp.sync(this.dataDir);
    mkdirp.sync(this.dashboardDataDir);

    const filePath = path.join(this.dashboardDataDir, file);

    if (!fs.existsSync(filePath)) {
      this.overwriteFile(filePath, {})
    }

    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      return jsonData;
    } catch (error) {
      this.logger.error(`Error reading or creating the JSON file ${file}:`, error);
      throw error;
    }
  }

  private getUserCreds(): { username: string, password: string } {
    this.logger.log('Getting user credentials')

    return this.readJSONFile(AUTH_FILE)
  }

  private overwriteFile(file: string, newData: any): void {
    this.logger.log(`Writing to ${file}`)

    const filePath = path.join(this.dashboardDataDir, file);

    try {
      fs.writeJSONSync(filePath, newData);
    } catch (error) {
      this.logger.error('Error overwriting JSON file:', error);
      throw error;
    }
  }

  private renewProxmoxCredsIfExpired() {
    this.logger.log('Reading cookie from file')

    const cookie = this.readJSONFile(COOKIE_FILE)

    this.proxmoxCookie = cookie['ticket']
    this.proxmoxToken = cookie['CSRFPreventionToken']
    this.cookieTimestamp = cookie['timestamp']

    this.proxmoxHeaders = {
      headers: {
        Cookie: `PVEAuthCookie=${this.proxmoxCookie}`
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    };

    if (Date.now() >= this.cookieTimestamp + TWO_HOURS) {
      this.logger.log('Cookie expired. Renewing cookie from server')
      this.getProxmoxCredsFromServer()
    } else {
      this.logger.log('Cookie still valid!')
    }
  }

  private getProxmoxCredsFromServer() {
    const { username, password } = this.getUserCreds()
    const params = new URLSearchParams();

    params.append('username', username);
    params.append('password', password);

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

        const cookieFileData = {
          ticket: this.proxmoxCookie,
          CSRFPreventionToken: this.proxmoxToken,
          timestamp: this.cookieTimestamp
        }

        this.overwriteFile(COOKIE_FILE, cookieFileData)

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
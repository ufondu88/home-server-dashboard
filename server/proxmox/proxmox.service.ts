import { Injectable, Logger } from '@nestjs/common';
import { CreateProxmoxDto } from './dto/create-proxmox.dto';
import { UpdateProxmoxDto } from './dto/update-proxmox.dto';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { Observable, combineLatest, firstValueFrom, forkJoin, from, map, switchMap, tap } from 'rxjs';
import * as https from 'https'

const TWO_HOURS = 60 * 60 * 1000 * 2
const AUTH_FILE = 'auth.json'
const COOKIE_FILE = 'cookie.json'

@Injectable()
export class ProxmoxService {
  private logger = new Logger('proxmox-service')

  private readonly dataDir = '/data';
  private readonly dashboardDataDir = '/data/dashboard-apps';

  user = process.env.PROXMOX_USER
  password = process.env['PROXMOX_PASSWORD']
  domain = "https://192.168.86.53:8006/api2/json"
  cookieTimestamp = 0
  proxmoxHeaders;
  proxmoxCookie: string
  proxmoxToken: string
  containers: LXCContainer[] = []
  vms: VirtualMachine[] = []
  nodes: NodeInfo[] = []

  config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Disables SSL certificate verification (use with caution)
    })
  };

  constructor(private readonly httpService: HttpService) {
    this.renewProxmoxCredsIfExpired()
  }

  create(createProxmoxDto: CreateProxmoxDto) {
    return 'This action adds a new proxmox';
  }

  findAll() {    
    this.renewProxmoxCredsIfExpired()

    return this.getAllNodes().pipe(
      switchMap(nodes => {
        this.nodes = nodes;

        const vms$: Observable<VirtualMachine[]>[] = []
        const containers$: Observable<LXCContainer[]>[] = []

        nodes.forEach(node => {
          const nodeName = node.node

          vms$.push(this.getAllVMs(nodeName))
          containers$.push(this.getAllContainers(nodeName))
        })      
        
        const vmsForkJoin$ = combineLatest(vms$)
        const containersForkJoin$ = combineLatest(containers$)

        // Use forkJoin to wait for all observables to complete
        return forkJoin([vmsForkJoin$, containersForkJoin$])
      }),
      map((res: [VirtualMachine[][], LXCContainer[][]]) => {
        const vms = res[0][0]
        const containers = res[1][0]

        return { nodes: this.nodes, vms, containers }
      })
    )
  }

  getAllContainers(nodeName: string) {
    this.renewProxmoxCredsIfExpired()

    const url = `${this.domain}/nodes/${nodeName}/lxc`

    return this.httpService.get(url, this.proxmoxHeaders).pipe(
      map(res => res['data']['data'] as LXCContainer[]),
      tap(containers => this.containers = containers)
    )
  }

  getAllVMs(nodeName: string) {
    this.renewProxmoxCredsIfExpired()

    const url = `${this.domain}/nodes/${nodeName}/qemu`

    return this.httpService.get(url, this.proxmoxHeaders).pipe(
      map(res => res['data']['data'] as VirtualMachine[]),
      tap(vms => this.vms = vms)
    )
  }

  getAllNodes() {
    this.renewProxmoxCredsIfExpired()

    const url = `${this.domain}/nodes`

    return this.httpService.get(url, this.proxmoxHeaders).pipe(
      map(res => res['data']['data'] as NodeInfo[]),
      map(nodes => {
        nodes.forEach(node => {
          node.cpu = +(node.cpu * 100).toFixed(2)
        })

        return nodes
      })
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} proxmox`;
  }

  update(id: number, updateProxmoxDto: UpdateProxmoxDto) {
    return `This action updates a #${id} proxmox`;
  }

  remove(id: number) {
    return `This action removes a #${id} proxmox`;
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
}

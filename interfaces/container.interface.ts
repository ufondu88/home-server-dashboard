export interface LXCContainer {
  maxmem: number;
  status: string;
  diskread: number;
  netout: number;
  cpus: number;
  maxswap: number;
  vmid: string;
  type: string;
  mem: number;
  uptime: number;
  swap: number;
  disk: number;
  diskwrite: number;
  netin: number;
  maxdisk: number;
  cpu: number;
  name: string;
  pid: number;
}

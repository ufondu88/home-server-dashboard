export interface VirtualMachine {
  uptime: number;
  convertedUptime: string;
  mem: number;
  pid: number;
  name: string;
  disk: number;
  diskwrite: number;
  netin: number;
  maxdisk: number;
  cpu: number;
  netout: number;
  diskread: number;
  maxmem: number;
  status: string;
  vmid: number;
  cpus: number;
  node: string;
}

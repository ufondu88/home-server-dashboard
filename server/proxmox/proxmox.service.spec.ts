import { Test, TestingModule } from '@nestjs/testing';
import { ProxmoxService } from './proxmox.service';
import { ProxmoxHttpService } from './proxmox-http-service.service';
import { of } from 'rxjs';
import { LXCContainer } from 'interfaces/container.interface';
import { Time } from 'interfaces/time.interface';
import { VirtualMachine } from 'interfaces/vm.interface';

// Mock ProxmoxHttpService
class MockProxmoxHttpService {
  request() {
    // Implement mock behavior here
    return of({});
  }
}

describe('ProxmoxService', () => {
  let service: ProxmoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxmoxService,
        {
          provide: ProxmoxHttpService,
          useClass: MockProxmoxHttpService,
        },
      ],
    }).compile();

    service = module.get<ProxmoxService>(ProxmoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllContainers', () => {
    it('should get all containers', (done) => {
      const nodename = 'exampleNode';
      const id = 'someId';
      const containersMock: LXCContainer[] = [
        {
          maxmem: 1,
          status: "string",
          diskread: 1,
          netout: 1,
          cpus: 1,
          maxswap: 1,
          vmid: "string",
          type: "string",
          mem: 1,
          uptime: 1,
          convertedUptime: "string",
          swap: 1,
          disk: 1,
          diskwrite: 1,
          netin: 1,
          maxdisk: 1,
          cpu: 1,
          name: "string",
          pid: 1,
          node: "string",
        }
      ]

      jest.spyOn<ProxmoxService, any>(service, 'get').mockReturnValue(of(containersMock))

      service.getAllContainers(id, nodename).subscribe(result => {
        expect(result).toEqual(containersMock);
        expect(service['containers']).toEqual(containersMock)
        expect(service.get).toHaveBeenCalledWith(`${service['domain']}/nodes/${nodename}/lxc`, id);

        done()
      })

    });
  });

  describe('getAllVMs', () => {
    it('should get all VMs for a node', (done) => {
      const id = 'someId';
      const nodename = 'exampleNode';
      const vmsMock: VirtualMachine[] = [];

      jest.spyOn(service, 'get').mockReturnValue(of(vmsMock));

      service.getAllVMs(id, nodename).subscribe(() => {
        expect(service.vms).toEqual(vmsMock);
        expect(service.get).toHaveBeenCalledWith(`${service['domain']}/nodes/${nodename}/qemu`, id);

        done()
      }); 
    });
  });

  describe('toggleVM', () => {
    it('should shutdown VM', (done) => {
      const vmid = '123';
      const vmname = 'TestVM';
      const nodename = 'exampleNode';
      const action = 'shutdown';

      jest.spyOn(service['logger'], 'warn');
      jest.spyOn(service, 'post').mockReturnValue(of('done'));

      service.toggleVM(vmid, vmname, nodename, action).subscribe(() => {
        expect(service['logger'].warn).toHaveBeenCalledWith(`Shutting down VM ${vmname} in ${nodename}`);
        expect(service.post).toHaveBeenCalledWith(`${service['domain']}/nodes/${nodename}/qemu/${vmid}/status/${action}`, null);

        done()
      });
    });

    it('should start VM', (done) => {
      const vmid = '123';
      const vmname = 'TestVM';
      const nodename = 'exampleNode';
      const action = 'start';

      jest.spyOn(service['logger'], 'warn');
      jest.spyOn(service, 'post').mockReturnValue(of('done'));

      service.toggleVM(vmid, vmname, nodename, action).subscribe(() => {
        expect(service['logger'].warn).toHaveBeenCalledWith(`Starting VM ${vmname} in ${nodename}`);
        expect(service.post).toHaveBeenCalledWith(`${service['domain']}/nodes/${nodename}/qemu/${vmid}/status/${action}`, null);

        done()
      });
    });
  });

  describe('convertSeconds', () => {
    it('should format 1 second to proper time format', () => {
      const seconds = 1

      const result = service.convertSeconds(seconds)

      expect(result).toBe(`${seconds} second`)
    })

    it('should format less than 1 minute to proper time format', () => {
      const seconds = 12

      const result = service.convertSeconds(seconds)

      expect(result).toBe(`${seconds} seconds`)
    })

    it('should format 1 minute to proper time format', () => {
      const seconds = 60

      const result = service.convertSeconds(seconds)

      expect(result).toBe(`1 minute and 0 seconds`)
    })

    it('should format less than 1 hour to proper time format', () => {
      const seconds = 70

      const result = service.convertSeconds(seconds)

      expect(result).toBe(`1 minute and 10 seconds`)
    })

    it('should convert seconds to formatted uptime string in default "vm" format', () => {
      const seconds = 3665; // 1 hour, 1 minute, and 5 seconds
      const formattedUptime = service.convertSeconds(seconds);

      expect(formattedUptime).toEqual('1 hour and 1 minute');
    });

    it('should convert seconds to formatted uptime string in "full" format', () => {
      const seconds = 90061; // 1 day, 1 hour, 1 minute, and 1 second
      const formattedUptime = service.convertSeconds(seconds, 'full');

      expect(formattedUptime).toEqual('1 day 1 hour 1 minute and 1 second');
    });
  })

  describe('formatUptime', () => {
    it('should format less than 1 day uptime in "vm" format', () => {
      const time: Time = { days: 0, hours: 3, minutes: 45, seconds: 30 };
      const formattedUptime = service.formatUptime(time, 'vm');

      expect(formattedUptime).toEqual('3 hours and 45 minutes');
    });

    it('should format more than 1 day uptime in "vm" format', () => {
      const time: Time = { days: 2, hours: 3, minutes: 45, seconds: 30 };
      const formattedUptime = service.formatUptime(time, 'vm');

      expect(formattedUptime).toEqual('2 days and 3 hours');
    });

    it('should format less than 1 hour uptime in "vm" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 45, seconds: 30 };
      const formattedUptime = service.formatUptime(time, 'vm');

      expect(formattedUptime).toEqual('45 minutes and 30 seconds');
    });

    it('should format less than 1 minute uptime in "vm" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 0, seconds: 30 };
      const formattedUptime = service.formatUptime(time, 'vm');

      expect(formattedUptime).toEqual('30 seconds');
    });

    it('should format less than 1 second uptime in "vm" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 0, seconds: 1 };
      const formattedUptime = service.formatUptime(time, 'vm');

      expect(formattedUptime).toEqual('1 second');
    });

    it('should format less than 1 day uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 12, minutes: 30, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('12 hours 30 minutes and 15 seconds');
    });

    it('should format 1 hour uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 1, minutes: 30, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('1 hour 30 minutes and 15 seconds');
    });

    it('should format less than 1 hour uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 30, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('30 minutes and 15 seconds');
    });

    it('should format 1 minute uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 1, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('1 minute and 15 seconds');
    });

    it('should format less than 1 minute uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 0, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('15 seconds');
    });

    it('should format 1 second uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 0, seconds: 1 };
      const formattedUptime = service.formatUptime(time, 'full');

      expect(formattedUptime).toEqual('1 second');
    });

    it('should format less than 1 minute uptime in "full" format', () => {
      const time: Time = { days: 0, hours: 0, minutes: 0, seconds: 15 };
      const formattedUptime = service.formatUptime(time, 'full');
 
      expect(formattedUptime).toEqual('15 seconds');
    });

    it('should handle default case for unknown format', () => {
      const time: Time = { days: 1, hours: 5, minutes: 15, seconds: 45 };
      const formattedUptime = service.formatUptime(time, 'unknownFormat');

      expect(formattedUptime).toEqual('1 day 5 hours 15 minutes and 45 seconds');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
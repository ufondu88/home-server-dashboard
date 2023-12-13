import { Test, TestingModule } from '@nestjs/testing';
import { ProxmoxController } from './proxmox.controller';
import { ProxmoxService } from './proxmox.service';
import { Observable, of } from 'rxjs';

class ProxmoxServiceMock {
  getAllNodes(id: string): Observable<any> {
    return of([]);
  }

  getAllContainers(id: string, node: string): Observable<any> {
    return of([]);
  }

  getNodeSummary(id: string, node: string): Observable<any> {
    return of([]);
  }

  getNodeStorage(id: string, node: string): Observable<any> {
    return of([]);
  }

  getNodeContainers(id: string, node: string): Observable<any> {
    return of([]);
  }

  getNodeVMs(id: string, node: string): Observable<any> {
    return of([]);
  }

  toggleVM(vmid: string, vmname: string, nodename: string, action: string): Observable<any> {
    return of('done');
  }
}

describe('ProxmoxController', () => {
  let controller: ProxmoxController;
  let proxmoxService: ProxmoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxmoxController],
      providers: [
        {
          provide: ProxmoxService,
          useClass: ProxmoxServiceMock, // Use the mock class
        },
      ],
    }).compile();

    controller = module.get<ProxmoxController>(ProxmoxController);
    proxmoxService = module.get<ProxmoxService>(ProxmoxService);
  });

  describe('findAll', () => {
    it('should return an observable with the result of getAllNodes', () => {
      const getAllNodesSpy = jest.spyOn(proxmoxService, 'getAllNodes').mockReturnValue(of([]));
      const result = controller.findAll('123');

      expect(result).toBeInstanceOf(Observable);
      expect(getAllNodesSpy).toHaveBeenCalledWith('123');
    });
  });

  describe('getAllContainers', () => {
    it('should return an observable with the result of getAllContainers', () => {
      const getAllContainersSpy = jest.spyOn(proxmoxService, 'getAllContainers').mockReturnValue(of([]));
      const result = controller.getAllContainers({ node: 'node1', id: '123' });

      expect(result).toBeInstanceOf(Observable);
      expect(getAllContainersSpy).toHaveBeenCalledWith('123', 'node1');
    });
  });

  describe('getNodeSummary', () => {
    it('should return an observable with the result of getNodeSummary', () => {
      const getNodeSummarySpy = jest.spyOn(proxmoxService, 'getNodeSummary').mockReturnValue(of([]));
      const result = controller.getNodeSummary({ node: 'node1', id: '123' });

      expect(result).toBeInstanceOf(Observable);
      expect(getNodeSummarySpy).toHaveBeenCalledWith('123', 'node1');
    });
  });

  describe('getNodeStorage', () => {
    it('should return an observable with the result of getNodeStorage', () => {
      const getNodeStorageSpy = jest.spyOn(proxmoxService, 'getNodeStorage').mockReturnValue(of([]));
      const result = controller.getNodeStorage({ node: 'node1', id: '123' });

      expect(result).toBeInstanceOf(Observable);
      expect(getNodeStorageSpy).toHaveBeenCalledWith('123', 'node1');
    });
  });

  describe('getNodeVMs', () => {
    it('should return an observable with the result of getNodeVMs', () => {
      const getNodeVMsSpy = jest.spyOn(proxmoxService, 'getNodeVMs').mockReturnValue(of([]));
      const result = controller.getNodeVMs({ node: 'node1', id: '123' });

      expect(result).toBeInstanceOf(Observable);
      expect(getNodeVMsSpy).toHaveBeenCalledWith('123', 'node1');
    });
  });

  describe('getNodeContainers', () => {
    it('should return an observable with the result of getNodeContainers', () => {
      const getNodeContainersSpy = jest.spyOn(proxmoxService, 'getNodeContainers').mockReturnValue(of([]));
      const result = controller.getNodeContainers({ node: 'node1', id: '123' });

      expect(result).toBeInstanceOf(Observable);
      expect(getNodeContainersSpy).toHaveBeenCalledWith('123', 'node1');
    });
  });

  describe('toggleVM', () => {
    it('should return an observable with the result of toggleVM', () => {
      const toggleVMSpy = jest.spyOn(proxmoxService, 'toggleVM').mockReturnValue(of([]));
      const result = controller.toggleVM({ action: 'start', vmid: '1', vmname: 'vm1', nodename: 'node1' });
      
      expect(result).toBeInstanceOf(Observable);
      expect(toggleVMSpy).toHaveBeenCalledWith('1', 'vm1', 'node1', 'start');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs-extra';
import { ProxmoxHttpService } from './proxmox-http-service.service';
import { of, throwError } from 'rxjs';
import { EXPIRATION_TIME } from '../constants';
import { CreateIntegrationDto } from 'server/integration/dto/create-integration.dto';

describe('ProxmoxHttpService', () => {
  let service: ProxmoxHttpService;
  let httpServiceMock: HttpService;

  const responseMock = { data: { data: 'mockData' } };
  const mockHttpService = {
    request: jest.fn(() => of(responseMock)),
    post: jest.fn(() => of(responseMock))
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxmoxHttpService, {
        provide: HttpService,
        useValue: mockHttpService,
      }],
    }).compile();

    service = module.get<ProxmoxHttpService>(ProxmoxHttpService);
    httpServiceMock = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('request', () => {
    it('should handle GET request', async () => {
      const url = 'https://example.com';
      const id = 'someId';

      jest.spyOn<ProxmoxHttpService, any>(service, 'renewProxmoxCredsIfExpired').mockReturnValueOnce(null)

      const result$ = service.request('get', url, id);

      result$!.subscribe(result => {
        expect(result).toBe('mockData');
        expect(httpServiceMock.request).toHaveBeenCalledWith({
          method: 'get',
          url,
          headers: service['proxmoxHeaders'],
        });
      })

    });

    it('should handle error for GET request', async () => {
      const url = 'https://example.com';
      const id = 'someId';

      const errorMock = { message: 'Proxmox cookie not found for id: someId', status: 500 };

      jest.spyOn<ProxmoxHttpService, any>(service, 'renewProxmoxCredsIfExpired').mockReturnValueOnce(null)
      jest.spyOn<HttpService, any>(httpServiceMock, 'request').mockReturnValue(throwError(() => new Error('error')))

      const result$ = service['request']('get', url, id);

      result$!.subscribe({
        error(err) {      
          expect(err).toBe(errorMock)
          expect(httpServiceMock.request).toHaveBeenCalledWith({
            method: 'get',
            url,
            headers: service['proxmoxHeaders'],
          });
        },
      })

    });

    // Similar tests for other HTTP methods (put, post, delete)...
  });

  describe('renewProxmoxCredsIfExpired', () => {
    it('should renew credentials if expired', () => {
      const id = 'someId';
      const cookieMock = {
        ticket: 'mockTicket',
        CSRFPreventionToken: 'mockCSRFToken',
        timestamp: Date.now() - (EXPIRATION_TIME + 1),
      };

      jest.spyOn<ProxmoxHttpService, any>(service, 'getLocalProxmoxCookie').mockReturnValueOnce(cookieMock);
      jest.spyOn<ProxmoxHttpService, any>(service, 'getProxmoxCredsFromServer').mockReturnValue(of({}))

      service['renewProxmoxCredsIfExpired'](id);

      expect(service['proxmoxHeaders']).toBeDefined();
      expect(service['proxmoxCookie']).toBe(cookieMock.ticket);
      expect(service['proxmoxToken']).toBe(cookieMock.CSRFPreventionToken);
    });

    it('should not renew credentials if not expired', () => {
      const id = 'someId';
      const cookieMock = {
        ticket: 'mockTicket',
        CSRFPreventionToken: 'mockCSRFToken',
        timestamp: Date.now(),
      };

      jest.spyOn<ProxmoxHttpService, any>(service, 'getLocalProxmoxCookie').mockReturnValueOnce(cookieMock);
      jest.spyOn<ProxmoxHttpService, any>(service, 'getProxmoxCredsFromServer').mockImplementationOnce(() => { });

      service['renewProxmoxCredsIfExpired'](id);

      expect(service['proxmoxHeaders']).toBeDefined();
      expect(service['proxmoxCookie']).toBe(cookieMock.ticket);
      expect(service['proxmoxToken']).toBe(cookieMock.CSRFPreventionToken);
    });
  });

  describe('getLocalProxmox', () => {
    it('should return the local proxmox data', () => {
      const id = '1';
      const mockApps: CreateIntegrationDto[] = [
        { id: '2', name: 'name', full_url: 'url', auth: 'auth', isAlive: true },
        { id, cookie: { ticket: 'mockTicket', CSRFPreventionToken: 'mockCSRFToken', timestamp: Date.now() }, name: 'name', full_url: 'url', auth: 'auth', isAlive: true },
      ];

      jest.spyOn<ProxmoxHttpService, any>(service, 'readJSONFile').mockReturnValueOnce(mockApps);

      const result = service['getLocalProxmox'](id);

      expect(result).toBe(mockApps[1]);
    });
  });

  describe('getLocalProxmoxCookie', () => {
    it('should return the local proxmox cookie', () => {
      const id = 'someId';
      const mockCookie = { ticket: 'mockTicket', CSRFPreventionToken: 'mockCSRFToken', timestamp: Date.now() };

      jest.spyOn<ProxmoxHttpService, any>(service, 'getLocalProxmox').mockReturnValueOnce({ cookie: mockCookie });

      const result = service['getLocalProxmoxCookie'](id);

      expect(result).toBe(mockCookie);
    });
  });

  describe('updateLocalProxmox', () => {
    it('should update the local proxmox data', () => {
      const id = 'someId';
      const mockApps = [
        { id: 'someOtherId' },
        { id, cookie: { ticket: 'oldTicket', CSRFPreventionToken: 'oldCSRFToken', timestamp: Date.now() } },
      ];

      const newData = { ticket: 'newTicket', CSRFPreventionToken: 'newCSRFToken', timestamp: Date.now() };

      jest.spyOn<ProxmoxHttpService, any>(service, 'readJSONFile').mockReturnValueOnce(mockApps);
      jest.spyOn<ProxmoxHttpService, any>(service, 'overwriteFile').mockImplementationOnce(() => { });

      service['updateLocalProxmox'](id, newData);

      expect(mockApps[1].cookie).toBe(newData);
    });
  });

  describe('readJSONFile', () => {
    it('should read JSON file successfully', () => {
      const file = 'someFile.json';
      const mockData = [{ id: 'someId' }];

      jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(mockData));

      const result = service['readJSONFile'](file);

      expect(result).toBe(mockData);
    });

    it('should throw an error when reading invalid JSON file', () => {
      const file = 'invalidFile.json';
      const error = 'Error'

      jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
        throw new Error(error);
      });

      expect(() => service['readJSONFile'](file)).toThrow(error);
    });
  });

  describe('getUserCreds', () => {
    it('should return user credentials', () => {
      const id = 'someId';
      const mockApps = [
        { id: 'someOtherId' },
        { id, auth: { username: 'mockUsername', password: 'mockPassword' } },
      ];

      jest.spyOn<ProxmoxHttpService, any>(service, 'getLocalProxmox').mockReturnValueOnce(mockApps[1]);

      const result = service['getUserCreds'](id);

      expect(result).toBe({ username: 'mockUsername', password: 'mockPassword' });
    });
  });

  describe('overwriteFile', () => {
    it('should overwrite JSON file successfully', () => {
      const file = 'someFile.json';
      const newData = [{ id: 'someId' }];

      jest.spyOn(fs, 'writeJSONSync').mockImplementationOnce(() => { });

      service['overwriteFile'](file, newData);

      expect(fs.writeJSONSync).toHaveBeenCalledWith(expect.any(String), newData);
    });

    it('should throw an error when overwriting JSON file fails', () => {
      const file = 'someFile.json';
      const newData = [{ id: 'someId' }];
      const error = 'Error'

      jest.restoreAllMocks();

      jest.spyOn(fs, 'writeJSONSync').mockImplementationOnce(() => {
        throw new Error(error);
      });

      expect(() => service['overwriteFile'](file, newData)).toThrow(error);
    });
  });

  describe('getProxmoxCredsFromServer', () => {
    it('should get proxmox credentials from the server', (done) => {
      const id = 'someId';
      const username = 'mockUsername';
      const password = 'mockPassword';
      const timestamp = 123

      const response = {
        data: { data: { ticket: 'mockTicket', CSRFPreventionToken: 'mockCSRFToken' } },
      };

      jest.spyOn<ProxmoxHttpService, any>(service, 'getUserCreds').mockReturnValueOnce({ username, password });
      jest.spyOn<HttpService, any>(httpServiceMock, 'post').mockReturnValueOnce(of(response));
      jest.spyOn<ProxmoxHttpService, any>(service, 'updateLocalProxmox').mockImplementationOnce(() => { });
      jest.spyOn<DateConstructor, any>(Date, 'now').mockReturnValueOnce(123);

      const result$ = service['getProxmoxCredsFromServer'](id)

      result$!.subscribe((result) => {
        const { ticket, CSRFPreventionToken } = result

        expect(httpServiceMock.post).toHaveBeenCalled()
        expect(service['updateLocalProxmox']).toHaveBeenCalledWith(id, { ticket, CSRFPreventionToken, timestamp })

        done()
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

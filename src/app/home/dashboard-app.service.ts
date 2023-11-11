import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardApp } from '../../../interfaces/dashboard-service.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardAppService {
  private apiUrl = 'http://localhost:3000/api/dashboard-app';
  private readonly _ALL_APPS = new BehaviorSubject<DashboardApp[]>([]);

  // Use readonly to prevent external modification of observables
  readonly ALL_APPS: Observable<DashboardApp[]> = this._ALL_APPS.asObservable();

  constructor(private http: HttpClient) { 
    this.getAll()
  }

  create(dashboardApp: DashboardApp) {
    console.log('sending data to API')
    this.http.post(this.apiUrl, dashboardApp).subscribe(res => {
      console.log(res)
      this.getAll()
    })
  }

  getAll() {
    console.log("Getting all apps")
    return this.http.get<DashboardApp[]>(this.apiUrl).subscribe(res => this._ALL_APPS.next(res))
  }

  
}

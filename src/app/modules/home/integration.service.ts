import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Integration } from 'interfaces/integration.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private apiUrl = 'http://localhost:3000/api/integration';
  private readonly _ALL_APPS = new BehaviorSubject<Integration[]>([]);

  // Use readonly to prevent external modification of observables
  readonly ALL_APPS: Observable<Integration[]> = this._ALL_APPS.asObservable();

  constructor(private http: HttpClient) {
    this.getAll()
  }

  create(integration: Integration) {
    return this.http.post(this.apiUrl, integration).pipe(
      tap(() => this.getAll())
    )
  }

  getAll() {
    console.log("Getting all apps")
    return this.http.get<Integration[]>(this.apiUrl).subscribe(res => this._ALL_APPS.next(res))
  }


}

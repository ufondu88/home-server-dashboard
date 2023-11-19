import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Integration } from 'interfaces/integration.interface';
import { BehaviorSubject, Observable, interval, startWith, switchMap, tap } from 'rxjs';
import { INTEGRATION_API_URL, objectArraysAreTheSame } from 'src/constants';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private readonly _ALL_APPS = new BehaviorSubject<Integration[]>([]);
  private existingApps: Integration[] = []

  // Use readonly to prevent external modification of observables
  readonly ALL_APPS: Observable<Integration[]> = this._ALL_APPS.asObservable();

  constructor(private http: HttpClient) {
    this.getAll()
  }

  create(integration: Integration) {
    return this.http.post(INTEGRATION_API_URL, integration).pipe(
      tap(() => this.getAll())
    )
  }

  getAll() {
    interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        console.log("Getting all apps")
        return this.http.get<Integration[]>(INTEGRATION_API_URL).pipe(
        )
      })
    ).subscribe(apps => {
      if (!objectArraysAreTheSame(apps, this.existingApps)) {
        this.existingApps = apps

        this._ALL_APPS.next(apps)
      }
    })
  }

  
}

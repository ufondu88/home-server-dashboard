import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Integration } from 'interfaces/integration.interface';
import { BehaviorSubject, Observable, interval, startWith, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private apiUrl = 'http://localhost:3000/api/integration';
  private readonly _ALL_APPS = new BehaviorSubject<Integration[]>([]);
  private existingApps: Integration[] = []

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
    interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        console.log("Getting all apps")
        return this.http.get<Integration[]>(this.apiUrl).pipe(
        )
      })
    ).subscribe(apps => {
      if (!this.objectArraysAreTheSame(apps, this.existingApps)) {
        this.existingApps = apps

        this._ALL_APPS.next(apps)
      }
    })
  }

  private objectArraysAreTheSame(array: any[], comparator: any[]) {
    // Check if the length of both arrays is the same
    if (array.length !== comparator.length) {
      return false;
    }

    // Check if every object in array exists in comparator
    return array.every(obj1 => comparator.some(obj2 => JSON.stringify(obj1) === JSON.stringify(obj2)));
  }
}

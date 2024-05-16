import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Shift } from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private baseUrl = environment.baseApiUrl;
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Shift[]> {
    return this.httpClient.get<Shift[]>(`${this.baseUrl}/shifts`);
  }

  getShiftsForEmployee(employeeId: string): Observable<Shift[]> {
    return this.httpClient.get<Shift[]>(`${this.baseUrl}/shifts?employeeId=${employeeId}`);
  }

  saveShift(shift: Shift): Observable<Shift> {
    return this.httpClient.patch<Shift>(`${this.baseUrl}/shifts/${shift.id}`, shift);
}
}

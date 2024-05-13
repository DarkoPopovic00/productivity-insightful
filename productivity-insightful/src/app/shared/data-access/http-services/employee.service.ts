import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Employee } from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private baseUrl = environment.baseApiUrl;
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(`${this.baseUrl}/employees`);
  }
}

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, tap } from 'rxjs';
import { DashboardInformation } from '../models/dashboard-information';
import { DashboardEmployee } from '../models/dashboard-employee';
import { EmployeeService, ShiftService } from '../../../shared/data-access';
import { DashboardCalculationService } from './dashboard-calculation.service';

@Injectable()
export class DashboardStateService {
    private dashboardInformationSubject = new BehaviorSubject<DashboardInformation>(new DashboardInformation());
    public dashboardInformation$ = this.dashboardInformationSubject.asObservable();

    private dashboardEmployeesSubject = new BehaviorSubject<DashboardEmployee[]>([]);
    public dashboardEmployees$ = this.dashboardEmployeesSubject.asObservable();

    private employeeService = inject(EmployeeService);
    private shiftService = inject(ShiftService);
    private dashboardCalculationService = inject(DashboardCalculationService);

    init(): void {
        forkJoin([this.employeeService.getAll(), this.shiftService.getAll()]).pipe(
            tap(([employees, shifts]) => {
                const { dashboardEmployees, dashboardInformation } = this.dashboardCalculationService.getData(employees, shifts);
                this.dashboardEmployeesSubject.next(dashboardEmployees);
                this.dashboardInformationSubject.next(dashboardInformation);
            }),
            map(() => undefined)
        ).subscribe();
    }

    updateDashboardInformation(data: DashboardInformation): void {
        this.dashboardInformationSubject.next(data);
    }

    updateDashboardEmployee(items: DashboardEmployee[]): void {
        this.dashboardEmployeesSubject.next(items);
    }
}

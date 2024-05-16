import { Injectable } from '@angular/core';
import { BulkSaveRequest } from './bulk-save-factory.service';
import { EmployeeService, ShiftService } from '../../../shared/data-access';
import { forkJoin, tap, withLatestFrom } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Injectable()
export class BulkSaveService {
    constructor(private employeeService: EmployeeService, private shiftService: ShiftService, private dashboardService: DashboardService) {}

    save(model: BulkSaveRequest[]) {
        return forkJoin(model.map((request) => this.saveRequest(request)));
    }

    private saveRequest(request: BulkSaveRequest) {
        return forkJoin([
            this.employeeService.saveEmployee(request.employeeForUpdate),
            ...request.shiftsForUpdate.map((shift) => this.shiftService.saveShift(shift)),
        ]).pipe(
            withLatestFrom(this.dashboardService.dashboardInformation$, this.dashboardService.dashboardEmployees$),
            tap(([[], dashboardInformation, dashboardEmployees]) => {
                dashboardInformation.totalAmountPaidForOvertimeHours -= request.currentTotalAmountPaidForOvertimeHours;
                dashboardInformation.totalAmountPaidForRegularHours -= request.currentTotalAmountPaidForRegularHours;
                dashboardInformation.totalClockedTime -= request.currentTotalClockedTime;

                dashboardInformation.totalAmountPaidForOvertimeHours += request.newTotalAmountPaidForOvertimeHours;
                dashboardInformation.totalAmountPaidForRegularHours += request.newTotalAmountPaidForRegularHours;
                dashboardInformation.totalClockedTime += request.newTotalClockedTime;

                this.dashboardService.updateDashboardInformation({ ...dashboardInformation });

                const index = dashboardEmployees.findIndex((e) => e.id === request.employeeForUpdate.id);
                if (index >= 0) {
                    const newEmployees = [...dashboardEmployees];
                    newEmployees[index] = {
                        ...newEmployees[index],
                        name: request.employeeForUpdate.name,
                        hourlyRate: request.employeeForUpdate.hourlyRate,
                        hourlyRateOvertime: request.employeeForUpdate.hourlyRateOvertime,
                        totalAmountPaidForOvertime: request.newTotalAmountPaidForOvertimeHours,
                        totalAmountPaidForRegularHours: request.newTotalAmountPaidForRegularHours,
                        totalClockedInTime: request.newTotalClockedTime
                    };

                    this.dashboardService.updateDashboardEmployee(newEmployees);
                }
            })
        );
    }
}

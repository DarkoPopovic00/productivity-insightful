import { Injectable, inject } from '@angular/core';
import { DashboardEmployee } from '../models/dashboard-employee';
import { FormArray, FormGroup } from '@angular/forms';
import { DashboardEmployeeForm } from '../components/employee-edit/form.factory';
import { DashboardService } from './dashboard.service';
import { BulkSaveRequest } from '../models/bulk-save-request';
import { ShiftHelperService } from './shift-helper.service';

@Injectable({ providedIn: 'root' })
export class BulkSaveFactoryService {
    private dashboardCalculationService = inject(DashboardService);
    private shiftHelperService = inject(ShiftHelperService);

    create(currentEmployeeData: DashboardEmployee[], employeeForms: FormGroup[]): BulkSaveRequest[] {
        const response = [];
        for (const form of employeeForms) {
            const currentEmployee = currentEmployeeData.find((e) => e.id === form.get('id')?.value);
            if (!currentEmployee) {
                continue;
            }

            response.push(this.createSingle(currentEmployee, form));
        }

        return response;
    }

    private createSingle(currentEmployee: DashboardEmployee, employeeForm: FormGroup): BulkSaveRequest {
        const employeeFormValue = employeeForm.value as DashboardEmployeeForm;
        const shiftData = this.shiftHelperService.getShiftsFromShiftsForm(employeeForm.get('shifts') as FormArray, currentEmployee.id);
        const billableData = this.dashboardCalculationService.calculateEmployeeBillabelData(
            shiftData.shiftsForCalculation,
            employeeFormValue.hourlyRate,
            employeeFormValue.hourlyRateOvertime
        );

        const response = {
            employeeForUpdate: {
                id: currentEmployee.id,
                email: currentEmployee.email,
                name: employeeFormValue.name,
                hourlyRate: employeeFormValue.hourlyRate,
                hourlyRateOvertime: employeeFormValue.hourlyRateOvertime,
            },
            shiftsForUpdate: shiftData.shiftsForUpdate,
            currentTotalAmountPaidForOvertimeHours: currentEmployee.totalAmountPaidForOvertime,
            currentTotalAmountPaidForRegularHours: currentEmployee.totalAmountPaidForRegularHours,
            currentTotalClockedTime: currentEmployee.totalClockedInTime,
            newTotalAmountPaidForOvertimeHours: billableData.totalAmountPaidForOvertime,
            newTotalAmountPaidForRegularHours: billableData.totalAmountPaidForRegularHours,
            newTotalClockedTime: billableData.totalClockedInTime,
        } as BulkSaveRequest;

        return response;
    }
}

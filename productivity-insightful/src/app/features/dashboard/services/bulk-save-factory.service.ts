import { Injectable, inject } from '@angular/core';
import { Employee, Shift } from '../../../shared/data-access';
import { DashboardEmployee } from '../models/dashboard-employee';
import { FormArray, FormGroup } from '@angular/forms';
import { DashboardEmployeeForm, ShiftFormModel } from '../components/employee-edit/form.factory';
import { DashboardCalculationService } from './dashboard-calculation.service';

export interface BulkSaveRequest {
    employeeForUpdate: Employee;
    shiftsForUpdate: Shift[];
    newTotalClockedTime: number;
    newTotalAmountPaidForRegularHours: number;
    newTotalAmountPaidForOvertimeHours: number;
    currentTotalClockedTime: number;
    currentTotalAmountPaidForRegularHours: number;
    currentTotalAmountPaidForOvertimeHours: number;
}

@Injectable({ providedIn: 'root' })
export class BulkSaveFactoryService {
    private dashboardCalculationService = inject(DashboardCalculationService);
    create(currentEmployeeData: DashboardEmployee[], employeeForms: FormGroup[]): BulkSaveRequest[] {
        const response = [];
        for (const form of employeeForms) {
            const currentEmployee = currentEmployeeData.find((e) => e.id === form.get('id')?.value);
            if (!currentEmployee) {
                continue;
            }

            response.push(this.handleSingle(currentEmployee, form));
        }

        return response;
    }

    private handleSingle(currentEmployee: DashboardEmployee, employeeForm: FormGroup): BulkSaveRequest {
        var response = {} as BulkSaveRequest;
        const employeeFormValue = employeeForm.value as DashboardEmployeeForm;
        response.employeeForUpdate = {
            id: currentEmployee.id,
            email: currentEmployee.email,
            name: employeeFormValue.name,
            hourlyRate: employeeFormValue.hourlyRate,
            hourlyRateOvertime: employeeFormValue.hourlyRateOvertime,
        } as Employee;

        const shiftData = this.getShifts(employeeForm.get('shifts') as FormArray, currentEmployee.id);

        response.shiftsForUpdate = shiftData.shiftsForUpdate;
        response.currentTotalAmountPaidForOvertimeHours = currentEmployee.totalAmountPaidForOvertime;
        response.currentTotalAmountPaidForRegularHours = currentEmployee.totalAmountPaidForRegularHours;
        response.currentTotalClockedTime = currentEmployee.totalClockedInTime;

        const billableData = this.dashboardCalculationService.calculateEmployeeBillabelData(
            shiftData.shiftsForCalculation,
            employeeFormValue.hourlyRate,
            employeeFormValue.hourlyRateOvertime
        );

        response.newTotalAmountPaidForOvertimeHours = billableData.totalAmountPaidForOvertime;
        response.newTotalAmountPaidForRegularHours = billableData.totalAmountPaidForRegularHours;
        response.newTotalClockedTime = billableData.totalClockedInTime;

        return response;
    }

    private getShifts(shiftsFormArray: FormArray, employeeId: string): { shiftsForUpdate: Shift[]; shiftsForCalculation: Shift[] } {
        const groupByShiftId = new Map<string, ShiftFormModel[]>();
        const shifts = shiftsFormArray.value as ShiftFormModel[];

        shifts.forEach((shift) => {
            groupByShiftId.has(shift.id) ? groupByShiftId.get(shift.id)?.push(shift) : groupByShiftId.set(shift.id, [shift]);
        });

        return {
            shiftsForCalculation: this.getShiftsForCalculation(groupByShiftId, employeeId),
            shiftsForUpdate: this.getShiftsForUpdate(shiftsFormArray, groupByShiftId, employeeId),
        };
    }

    private getShiftsForCalculation(groupByShiftId: Map<string, ShiftFormModel[]>, employeeId: string): Shift[] {
        const response = [];
        for (const [, shifts] of groupByShiftId.entries()) {
            response.push(this.normalizeShifts(employeeId, shifts));
        }
        return response;
    }

    private getShiftsForUpdate(shiftsFormArray: FormArray, groupByShiftId: Map<string, ShiftFormModel[]>, employeeId: string): Shift[] {
        const shiftsForUpdate = shiftsFormArray.controls.filter((c) => c.dirty);
        const response: Shift[] = [];

        if (shiftsForUpdate.length === 0) {
            return response;
        }

        for (const shift of shiftsForUpdate) {
            const shiftId = shift.get('id')?.value;
            const shifts = groupByShiftId.get(shiftId);
            if (shifts) {
                response.push(this.normalizeShifts(employeeId, shifts));
            }
        }

        return response;
    }

    private normalizeShifts(employeeId: string, shifts: ShiftFormModel[]): Shift {
        if (shifts.length === 1) {
            return { clockIn: shifts[0].clockInTime.getTime(), clockOut: shifts[0].clockOutTime.getTime(), employeeId, id: shifts[0].id };
        }

        const [shiftFirstPart, shiftSecondPart] = shifts;

        return { clockIn: shiftFirstPart.clockInTime.getTime(), clockOut: shiftSecondPart.clockOutTime.getTime(), employeeId, id: shiftFirstPart.id };
    }
}

import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { Shift } from '../../../../shared/data-access';
import { DashboardCalculationService } from '../../services/dashboard-calculation.service';
import { ShiftType } from './shift-types';

@Injectable({ providedIn: 'root' })
export class DashboardEmployeeFormFactoryService {
    constructor(private fb: FormBuilder, private dashboardCalculationService: DashboardCalculationService) {}

    create(employee: DashboardEmployee): FormGroup {
        return this.fb.group({
            name: [employee.name, Validators.required],
            hourlyRate: [employee.hourlyRate, [Validators.min(0.01), Validators.required]],
            hourlyRateOvertime: [employee.hourlyRateOvertime, [Validators.min(0.01), Validators.required]],
            shifts: this.fb.array([]),
        });
    }

    createShiftsArray(form: FormGroup, shifts: Shift[]): void {
        [...shifts]
            .sort((a, b) => a.clockIn - b.clockIn)
            .forEach((shift, index) => {
                this.createSingle(shift, index).forEach(shift => {
                    (form.get('shifts') as FormArray).push(shift);

                })
            });
    }

    private createSingle(shift: Shift, index: number): FormGroup[] {
        const clockIn = new Date(shift.clockIn);
        const clockOut = new Date(shift.clockOut);

        if (this.dashboardCalculationService.isMultiDayShift(shift.clockIn, shift.clockOut)) {
            const firstPartSeconds = this.dashboardCalculationService.calculateSecondsUntilEndOfDay(shift.clockIn);
            const secondPartSeconds = this.dashboardCalculationService.calculateSecondsFromStartOfDay(shift.clockOut);

            return [this.fb.group({
                name: `Shift ${index + 1}`,
                id: shift.id,
                clockInTime: clockIn,
                clockOutTime: [{value: new Date(new Date(clockOut).setHours(0,0,0,0)), disabled: true}],
                totalTime: [this.dashboardCalculationService.convertSecondsToTime(firstPartSeconds)],
                date: this.dashboardCalculationService.getDate(shift.clockIn),
                type: ShiftType.MultyDayShiftFirstPart
            }),
            this.fb.group({
                name: `Shift ${index + 1}`,
                id: shift.id,
                clockInTime: [{value: new Date(new Date(clockOut).setHours(0,0,0,0)), disabled: true}],
                clockOutTime: clockOut,
                totalTime: [this.dashboardCalculationService.convertSecondsToTime(secondPartSeconds)],
                date: this.dashboardCalculationService.getDate(shift.clockOut),
                type: ShiftType.MultyDayShiftSecondPart
            }),
        
        ];
        } else {
            const totalTime = this.dashboardCalculationService.convertSecondsToTime((shift.clockOut - shift.clockIn)/1000)
            return [this.fb.group({
                name: `Shift ${index + 1}`,
                id: shift.id,
                clockInTime: clockIn,
                clockOutTime: clockOut,
                totalTime: [{value: totalTime, disabled: true}],
                date: this.dashboardCalculationService.getDate(shift.clockIn),
                type: ShiftType.OneDayShift
            })];
        }

    }
}

import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { DateHelperService, Shift } from '../../../../shared';

@Injectable({ providedIn: 'root' })
export class DashboardEmployeeFormFactoryService {
    constructor(private fb: FormBuilder, private dateHelperService: DateHelperService) {}

    create(employee: DashboardEmployee): FormGroup {
        return this.fb.group({
            id: [employee.id],
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
                this.createSingleShift(shift, index).forEach((shift) => {
                    (form.get('shifts') as FormArray).push(shift);
                });
            });
    }

    private createSingleShift(shift: Shift, index: number): FormGroup[] {
        const clockIn = new Date(shift.clockIn);
        const clockOut = new Date(shift.clockOut);

        if (this.dateHelperService.isMultiDaySpan(shift.clockIn, shift.clockOut)) {
            const firstShiftSecondsUntilMidnight = this.dateHelperService.calculateSecondsUntilEndOfDay(shift.clockIn);
            const secondShiftSecondsAfterMidnight = this.dateHelperService.calculateSecondsFromStartOfDay(shift.clockOut);

            return [
                this.fb.group({
                    name: `Shift ${index + 1}`,
                    id: shift.id,
                    clockInTime: clockIn,
                    clockOutTime: [{ value: new Date(new Date(clockOut).setHours(0, 0, 0, 0)), disabled: true }],
                    totalTime: [this.dateHelperService.convertSecondsToTime(firstShiftSecondsUntilMidnight)],
                    date: this.dateHelperService.getDate(shift.clockIn),
                }),
                this.fb.group({
                    name: `Shift ${index + 1}`,
                    id: shift.id,
                    clockInTime: [{ value: new Date(new Date(clockOut).setHours(0, 0, 0, 0)), disabled: true }],
                    clockOutTime: clockOut,
                    totalTime: [this.dateHelperService.convertSecondsToTime(secondShiftSecondsAfterMidnight)],
                    date: this.dateHelperService.getDate(shift.clockOut),
                }),
            ];
        } else {
            const totalTime = this.dateHelperService.convertSecondsToTime((shift.clockOut - shift.clockIn) / 1000);
            return [
                this.fb.group({
                    name: `Shift ${index + 1}`,
                    id: shift.id,
                    clockInTime: clockIn,
                    clockOutTime: clockOut,
                    totalTime: [{ value: totalTime, disabled: true }],
                    date: this.dateHelperService.getDate(shift.clockIn),
                }),
            ];
        }
    }
}

export interface ShiftFormModel {
    name: string;
    id: string;
    clockInTime: Date;
    clockOutTime: Date;
    totalTime: string;
    date: string;
}

export interface DashboardEmployeeForm {
    id: string;
    name: string;
    hourlyRate: number;
    hourlyRateOvertime: number;
    shifts: ShiftFormModel[];
}

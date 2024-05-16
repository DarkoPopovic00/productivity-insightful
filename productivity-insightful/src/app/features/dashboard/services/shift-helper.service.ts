import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ShiftFormModel } from '../components/employee-edit/form.factory';
import { Shift } from '../../../shared';

@Injectable({providedIn: 'root'})
export class ShiftHelperService {
    
    getShiftsFromShiftsForm(shiftsFormArray: FormArray, employeeId: string): { shiftsForUpdate: Shift[]; shiftsForCalculation: Shift[] } {
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
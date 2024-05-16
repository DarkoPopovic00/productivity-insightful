import { Injectable } from '@angular/core';
import { Employee, Shift } from '../../../shared/data-access/models';
import { DashboardEmployee } from '../models/dashboard-employee';
import { DashboardInformation } from '../models/dashboard-information';

@Injectable({ providedIn: 'root' })
export class DashboardCalculationService {
    getData(employees: Employee[], shifts: Shift[]) {
        const dashboardInformation = new DashboardInformation();
        const dashboardEmployees = [];
        const shiftsByEmployee = this.getShiftsByEmployee(shifts);

        for (const employee of employees) {
            const dashboardEmployee = this.createDashboardEmployee(employee, shiftsByEmployee.get(employee.id) ?? []);

            dashboardInformation.totalAmountPaidForRegularHours += dashboardEmployee.totalAmountPaidForRegularHours;
            dashboardInformation.totalAmountPaidForOvertimeHours += dashboardEmployee.totalAmountPaidForOvertime;
            dashboardInformation.totalClockedTime += dashboardEmployee.totalClockedInTime;

            dashboardEmployees.push(dashboardEmployee);
        }

        dashboardInformation.totalNumberOfEmployees = employees.length;

        return { dashboardInformation, dashboardEmployees };
    }

    private getShiftsByEmployee(shifts: Shift[]): Map<string, Shift[]> {
        const shiftsByEmployee = new Map();

        shifts.forEach((shift) =>
            shiftsByEmployee.has(shift.employeeId) ? shiftsByEmployee.get(shift.employeeId)?.push(shift) : shiftsByEmployee.set(shift.employeeId, [shift])
        );
        return shiftsByEmployee;
    }

    private createDashboardEmployee(employee: Employee, shifts: Shift[]): DashboardEmployee {
        const response = new DashboardEmployee();
        const hoursByDate = new Map<string, number>();

        response.id = employee.id;
        response.name = employee.name;
        response.email = employee.email;
        response.hourlyRate = employee.hourlyRate;
        response.hourlyRateOvertime = employee.hourlyRateOvertime;

        shifts.forEach((shift) => {
            const clockInDate = this.getDate(shift.clockIn);
            const clockOutDate = this.getDate(shift.clockOut);

            // is shift start and end in same day
            if (!this.isMultiDayShift(shift.clockIn, shift.clockOut)) {
                if (hoursByDate.has(clockInDate)) {
                    let workedTime = hoursByDate.get(clockInDate)!;
                    workedTime += this.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn);
                    hoursByDate.set(clockInDate, workedTime);
                } else {
                    hoursByDate.set(clockInDate, this.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn));
                }
            } else {
                if (hoursByDate.has(clockInDate)) {
                    let workedTime = hoursByDate.get(clockInDate)!;
                    workedTime += this.calculateSecondsUntilEndOfDay(shift.clockIn);
                    hoursByDate.set(clockInDate, workedTime);
                } else {
                    hoursByDate.set(clockInDate, this.calculateSecondsUntilEndOfDay(shift.clockIn));
                }

                if (hoursByDate.has(clockOutDate)) {
                    let workedTime2 = hoursByDate.get(clockOutDate)!;
                    workedTime2 += this.calculateSecondsFromStartOfDay(shift.clockOut);
                    hoursByDate.set(clockOutDate, workedTime2);
                } else {
                    hoursByDate.set(clockOutDate, this.calculateSecondsFromStartOfDay(shift.clockOut));
                }
            }
        });

        let regularHours = 0;
        let overtimeHours = 0;

        for (const group of hoursByDate) {
            const hours = group[1] / 3600;
            const overtime = hours - 8;
            if (overtime > 0) {
                overtimeHours += overtime;
            }

            regularHours += hours > 8 ? 8 : hours;
        }

        response.totalClockedInTime = overtimeHours + regularHours;
        response.totalAmountPaidForRegularHours = employee.hourlyRate * regularHours;
        response.totalAmountPaidForOvertime = employee.hourlyRateOvertime * overtimeHours;
        return response;
    }

    getDate(time: number): string {
        const date = new Date(time);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }

    calculateSecondsUntilEndOfDay(time: number): number {
        var d = new Date(time);
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        return 24 * 60 * 60 - h * 60 * 60 - m * 60 - s;
    }

    calculateSecondsFromStartOfDay(time: number): number {
        var d = new Date(time);
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        return h * 60 * 60 + m * 60 + s;
    }

    private calculateTimeDifferenceInSeconds(time2: number, time1: number): number {
        return (time2 - time1) / 1000;
    }

    isMultiDayShift(startTime: number, endTime: number): boolean {
        return this.getDate(startTime) !== this.getDate(endTime);
    }

    convertSecondsToTime(seconds: number): string {
        const isNegative = seconds < 0;

        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        return `${isNegative? '-': ''}${Math.abs(hours).toString().padStart(2, '0')}:${Math.abs(minutes).toString().padStart(2, '0')}`
    }
}

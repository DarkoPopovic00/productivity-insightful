import { Injectable } from '@angular/core';
import { DashboardEmployee } from '../models/dashboard-employee';
import { DashboardInformation } from '../models/dashboard-information';
import { DateHelperService, Employee, Shift } from '../../../shared';

@Injectable({ providedIn: 'root' })
export class DashboardCalculationService {
    constructor(private dateHelper: DateHelperService) {}

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

    public createDashboardEmployee(employee: Employee, shifts: Shift[]): DashboardEmployee {
        const response = new DashboardEmployee();

        response.id = employee.id;
        response.name = employee.name;
        response.email = employee.email;
        response.hourlyRate = employee.hourlyRate;
        response.hourlyRateOvertime = employee.hourlyRateOvertime;

        const billableData = this.calculateEmployeeBillabelData(shifts, employee.hourlyRate, employee.hourlyRateOvertime);

        response.totalClockedInTime = billableData.totalClockedInTime;
        response.totalAmountPaidForRegularHours = billableData.totalAmountPaidForRegularHours;
        response.totalAmountPaidForOvertime = billableData.totalAmountPaidForOvertime;
        return response;
    }

    public calculateEmployeeBillabelData(
        shifts: Shift[],
        hourlyRate: number,
        hourlyRateOvertime: number
    ): { totalClockedInTime: number; totalAmountPaidForRegularHours: number; totalAmountPaidForOvertime: number } {
        const hoursByDate = new Map<string, number>();

        shifts.forEach((shift) => {
            const clockInDate = this.dateHelper.getDate(shift.clockIn);
            const clockOutDate = this.dateHelper.getDate(shift.clockOut);

            // is shift start and end in same day
            if (!this.dateHelper.isMultiDaySpan(shift.clockIn, shift.clockOut)) {
                if (hoursByDate.has(clockInDate)) {
                    let workedTime = hoursByDate.get(clockInDate)!;
                    workedTime += this.dateHelper.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn);
                    hoursByDate.set(clockInDate, workedTime);
                } else {
                    hoursByDate.set(clockInDate, this.dateHelper.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn));
                }
            } else {
                if (hoursByDate.has(clockInDate)) {
                    let workedTime = hoursByDate.get(clockInDate)!;
                    workedTime += this.dateHelper.calculateSecondsUntilEndOfDay(shift.clockIn);
                    hoursByDate.set(clockInDate, workedTime);
                } else {
                    hoursByDate.set(clockInDate, this.dateHelper.calculateSecondsUntilEndOfDay(shift.clockIn));
                }

                if (hoursByDate.has(clockOutDate)) {
                    let workedTime2 = hoursByDate.get(clockOutDate)!;
                    workedTime2 += this.dateHelper.calculateSecondsFromStartOfDay(shift.clockOut);
                    hoursByDate.set(clockOutDate, workedTime2);
                } else {
                    hoursByDate.set(clockOutDate, this.dateHelper.calculateSecondsFromStartOfDay(shift.clockOut));
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

        return {
            totalAmountPaidForOvertime: hourlyRateOvertime * overtimeHours,
            totalAmountPaidForRegularHours: hourlyRate * regularHours,
            totalClockedInTime: overtimeHours + regularHours,
        };
    }
}

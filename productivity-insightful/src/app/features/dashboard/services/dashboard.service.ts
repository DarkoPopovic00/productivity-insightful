import { Injectable } from '@angular/core';
import { DashboardEmployee } from '../models/dashboard-employee';
import { DashboardInformation } from '../models/dashboard-information';
import { DateHelperService, Employee, Shift } from '../../../shared';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    constructor(private dateHelper: DateHelperService) {}

    getInitialData(employees: Employee[], shifts: Shift[]): {dashboardEmployees: DashboardEmployee[], dashboardInformation: DashboardInformation} {
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

    public createDashboardEmployee(employee: Employee, shifts: Shift[]): DashboardEmployee {
        const billableData = this.calculateEmployeeBillabelData(shifts, employee.hourlyRate, employee.hourlyRateOvertime);
        return {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            hourlyRate: employee.hourlyRate,
            hourlyRateOvertime: employee.hourlyRateOvertime,
            totalClockedInTime: billableData.totalClockedInTime,
            totalAmountPaidForRegularHours: billableData.totalAmountPaidForRegularHours,
            totalAmountPaidForOvertime: billableData.totalAmountPaidForOvertime
        } as DashboardEmployee;
    }

    public calculateEmployeeBillabelData(
        shifts: Shift[],
        hourlyRate: number,
        hourlyRateOvertime: number
    ): { totalClockedInTime: number; totalAmountPaidForRegularHours: number; totalAmountPaidForOvertime: number } {
        const secondsPerDate = this.calculateWorkingSecondsPerDay(shifts);
        let regularHours = 0;
        let overtimeHours = 0;
        const overtimeThreshold = 8;
        const secondsInAnHour = 3600;
        
        for (const [, timeInSeconds] of secondsPerDate) {
            const hours = +(timeInSeconds / secondsInAnHour).toFixed(2);
            const overtime = Math.max(0, hours - overtimeThreshold);
            overtimeHours += overtime;
            regularHours += Math.min(hours, overtimeThreshold);
        }
        
        const totalAmountPaidForOvertime = +(hourlyRateOvertime * overtimeHours).toFixed(2);
        const totalAmountPaidForRegularHours = +(hourlyRate * regularHours).toFixed(2);
        const totalClockedInTime = overtimeHours + regularHours;
        
        return {
            totalAmountPaidForOvertime,
            totalAmountPaidForRegularHours,
            totalClockedInTime,
        };
    }

    private getShiftsByEmployee(shifts: Shift[]): Map<string, Shift[]> {
        const shiftsByEmployee = new Map();

        shifts.forEach((shift) =>
            shiftsByEmployee.has(shift.employeeId) ? shiftsByEmployee.get(shift.employeeId)?.push(shift) : shiftsByEmployee.set(shift.employeeId, [shift])
        );
        return shiftsByEmployee;
    }

    private calculateWorkingSecondsPerDay(shifts: Shift[]): Map<string, number> {
        const secondsByDate = new Map<string, number>();

        const updateWorkedTime = (date: string, timeToAdd: number) => {
            const existingTime = secondsByDate.get(date) ?? 0;
            secondsByDate.set(date, existingTime + timeToAdd);
        };

        shifts.forEach((shift) => {
            const clockInDate = this.dateHelper.getDate(shift.clockIn);
            const clockOutDate = this.dateHelper.getDate(shift.clockOut);
            const isMultiDay = this.dateHelper.isMultiDaySpan(shift.clockIn, shift.clockOut);

            if (!isMultiDay) {
                const workedTime = this.dateHelper.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn);
                updateWorkedTime(clockInDate, workedTime);
            } else {
                const timeUntilEndOfDay = this.dateHelper.calculateSecondsUntilEndOfDay(shift.clockIn);
                const timeFromStartOfDay = this.dateHelper.calculateSecondsFromStartOfDay(shift.clockOut);
        
                updateWorkedTime(clockInDate, timeUntilEndOfDay);
                updateWorkedTime(clockOutDate, timeFromStartOfDay);
            }
        });

        return secondsByDate;
    }
}

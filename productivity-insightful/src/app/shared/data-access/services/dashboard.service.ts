import { Injectable } from '@angular/core';
import { DashboardInformation, Employee, Shift } from '../models';
import { EmployeeService, ShiftService } from '../http-services';
import { DashboardEmployee } from '../models/dashboard-employee';
import { Observable, combineLatest, concatMap, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private shiftsByEmployee = new Map<string, Shift[]>();
  constructor(
    private shiftService: ShiftService,
    private employeeService: EmployeeService
  ) {}

  getData(): Observable<DashboardInformation> {
    return combineLatest([
      this.getShiftsByEmployee(),
      this.getEmployees(),
    ]).pipe(
      map(([shiftsByEmployee, employees]) => {
        const response = new DashboardInformation();
        response.employees = employees.map((employee) =>
          this.createDashboardEmployee(
            employee,
            shiftsByEmployee.get(employee.id) ?? []
          )
        );

        response.employees.forEach((employee) => {
          response.totalClockedTime += employee.totalClockedInTime;
          response.totalAmountPaidForOvertimeHours +=
            employee.totalOvertimeAmountPaid;
          response.totalAmountPaidForRegularHours +=
            employee.totalAmountPaidForRegularHours;
        });
        return response;
      })
    );
  }

  private getShiftsByEmployee(): Observable<Map<string, Shift[]>> {
    this.shiftsByEmployee = new Map();
    return this.shiftService.getAll().pipe(
      map((shifts) => {
        shifts.forEach((shift) =>
          this.shiftsByEmployee.has(shift.employeeId)
            ? this.shiftsByEmployee.get(shift.employeeId)?.push(shift)
            : this.shiftsByEmployee.set(shift.employeeId, [shift])
        );
        return this.shiftsByEmployee;
      })
    );
  }

  private getEmployees(): Observable<Employee[]> {
    return this.employeeService.getAll();
  }

  private createDashboardEmployee(
    employee: Employee,
    shifts: Shift[]
  ): DashboardEmployee {
    const response = new DashboardEmployee();
    const hoursByDate = new Map<string, number>();

    response.id = employee.id;
    response.name = employee.name;
    response.email = employee.email;

    shifts.forEach((shift) => {
      const clockInDate = this.getDate(shift.clockIn);
      const clockOutDate = this.getDate(shift.clockOut);

      // is shift start and end in same day
      if (clockInDate === clockOutDate) {
        if (hoursByDate.has(clockInDate)) {
          let workedTime = hoursByDate.get(clockInDate)!;
          workedTime += this.calculateTimeDifferenceInSeconds(
            shift.clockOut,
            shift.clockIn
          );
          hoursByDate.set(clockInDate, workedTime);
        } else {
          hoursByDate.set(
            clockInDate,
            this.calculateTimeDifferenceInSeconds(shift.clockOut, shift.clockIn)
          );
        }
      } else {
        if (hoursByDate.has(clockInDate)) {
          let workedTime = hoursByDate.get(clockInDate)!;
          workedTime += this.calculateSecondsUntilEndOfDay(shift.clockIn);
          hoursByDate.set(clockInDate, workedTime);
        } else {
          hoursByDate.set(
            clockInDate,
            this.calculateSecondsUntilEndOfDay(shift.clockIn)
          );
        }

        if (hoursByDate.has(clockOutDate)) {
          let workedTime2 = hoursByDate.get(clockOutDate)!;
          workedTime2 += this.calculateSecondsFromStartOfDay(shift.clockOut);
          hoursByDate.set(clockOutDate, workedTime2);
        } else {
          hoursByDate.set(
            clockOutDate,
            this.calculateSecondsFromStartOfDay(shift.clockOut)
          );
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
    response.totalAmountPaidForRegularHours =
      employee.hourlyRate * regularHours;
    response.totalOvertimeAmountPaid =
      employee.hourlyRateOvertime * overtimeHours;
    return response;
  }

  private getDate(time: number): string {
    const date = new Date(time);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  private calculateSecondsUntilEndOfDay(time: number): number {
    var d = new Date(time);
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return 24 * 60 * 60 - h * 60 * 60 - m * 60 - s;
  }

  private calculateSecondsFromStartOfDay(time: number): number {
    var d = new Date(time);
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return h * 60 * 60 + m * 60 + s;
  }

  private calculateTimeDifferenceInSeconds(
    time2: number,
    time1: number
  ): number {
    return (time2 - time1) / 1000;
  }
}

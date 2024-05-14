import { DashboardEmployee } from './dashboard-employee';

export class DashboardInformation {
    totalNumberOfEmployees = 0;
    totalClockedTime = 0;
    totalAmountPaidForRegularHours = 0;
    totalAmountPaidForOvertimeHours = 0;
    employees: DashboardEmployee[] = [];
}
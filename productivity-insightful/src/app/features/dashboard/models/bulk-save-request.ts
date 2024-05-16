import { Employee, Shift } from '../../../shared';

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

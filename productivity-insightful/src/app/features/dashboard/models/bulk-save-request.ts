import { Employee, Shift } from '../../../shared/data-access';

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

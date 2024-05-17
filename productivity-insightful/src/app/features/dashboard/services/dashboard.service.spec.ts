import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { Employee, Shift } from '../../../shared';
import { DashboardInformation } from '../models/dashboard-information';

describe('DashboardService', () => {
    let service: DashboardService;
    let testEmployee: Employee;
    let testShifts: Shift[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DashboardService);
        testEmployee = getTestEmployee();
        testShifts = getTestShifts();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return correct data for calculateEmployeeBillabelData', () => {
        const expectedResponse = { totalClockedInTime: 10.92, totalAmountPaidForRegularHours: 16, totalAmountPaidForOvertime: 11.68 };
        const result = service.calculateEmployeeBillabelData(testShifts, testEmployee.hourlyRate, testEmployee.hourlyRateOvertime);
        expect(expectedResponse).toEqual(result);
    });

    it('should return correct dashboardInformation data for getInitialData', () => {
        const expectedResponse = Object.assign(new DashboardInformation(), {
            totalNumberOfEmployees: 2,
            totalAmountPaidForOvertimeHours: 23.36,
            totalAmountPaidForRegularHours: 32,
            totalClockedTime: 21.84,
        });
        const result = service.getInitialData([testEmployee, getTestEmployee2()], [...testShifts, ...getTestShifts2()]);
        expect(expectedResponse).toEqual(result.dashboardInformation);
    });
});

const getTestEmployee = () => ({
    id: '1',
    name: 'Thelma Pfannerstill',
    email: 'Thelma_Pfannerstill61@yahoo.com',
    hourlyRate: 2,
    hourlyRateOvertime: 4,
});

const getTestEmployee2 = () => ({
    id: '2',
    name: 'Thelma Pfannerstill Test 2',
    email: 'Thelma_Pfannerstill61@yahoo.com Test 2',
    hourlyRate: 2,
    hourlyRateOvertime: 4,
});

const getTestShifts = () => [
    {
        id: '77316680-69e1-4ed3-9419-f767644e584d',
        employeeId: '1',
        clockIn: 1671422604510,
        clockOut: 1671430953185,
    },
    {
        id: 'df6c31c2-758c-4dd4-8b16-da200f12cfbf',
        employeeId: '1',
        clockIn: 1671430953185,
        clockOut: 1671436190042,
    },
    {
        id: 'e86ae27c-33c3-4b27-8263-ef104f95b14e',
        employeeId: '1',
        clockIn: 1671436190042,
        clockOut: 1671443281756,
    },
    {
        id: '6780ef0a-956a-415f-8b5c-1e623bdabf04',
        employeeId: '1',
        clockIn: 1671443281756,
        clockOut: 1671446681866,
    },
    {
        id: '65f094d4-581b-4c0c-8479-2b3a3a95ebae',
        employeeId: '1',
        clockIn: 1671446681866,
        clockOut: 1671453460921,
    },
    {
        id: '24577f9b-3da7-48ab-9c52-1302075c32f6',
        employeeId: '1',
        clockIn: 1671453460921,
        clockOut: 1671458654606,
    },
    {
        id: 'bc0f83df-b795-45a8-9be7-e9fdd918b541',
        employeeId: '1',
        clockIn: 1671458654606,
        clockOut: 1671461928540,
    },
];

const getTestShifts2 = () => [
    {
        id: '77316680-69e1-4ed3-9419-f767644e584d',
        employeeId: '2',
        clockIn: 1671422604510,
        clockOut: 1671430953185,
    },
    {
        id: 'df6c31c2-758c-4dd4-8b16-da200f12cfbf',
        employeeId: '2',
        clockIn: 1671430953185,
        clockOut: 1671436190042,
    },
    {
        id: 'e86ae27c-33c3-4b27-8263-ef104f95b14e',
        employeeId: '2',
        clockIn: 1671436190042,
        clockOut: 1671443281756,
    },
    {
        id: '6780ef0a-956a-415f-8b5c-1e623bdabf04',
        employeeId: '2',
        clockIn: 1671443281756,
        clockOut: 1671446681866,
    },
    {
        id: '65f094d4-581b-4c0c-8479-2b3a3a95ebae',
        employeeId: '2',
        clockIn: 1671446681866,
        clockOut: 1671453460921,
    },
    {
        id: '24577f9b-3da7-48ab-9c52-1302075c32f6',
        employeeId: '2',
        clockIn: 1671453460921,
        clockOut: 1671458654606,
    },
    {
        id: 'bc0f83df-b795-45a8-9be7-e9fdd918b541',
        employeeId: '2',
        clockIn: 1671458654606,
        clockOut: 1671461928540,
    },
];

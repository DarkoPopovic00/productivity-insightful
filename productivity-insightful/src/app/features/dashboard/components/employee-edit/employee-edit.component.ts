import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { DashboardEmployeeFormFactoryService } from './form.factory';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { MatSelectModule } from '@angular/material/select';
import { TotalTimeUpdateDirective } from './total-time-update.directive';
import { ShiftService, TimePickerComponent } from '../../../../shared';

@Component({
    selector: 'app-employee-edit',
    standalone: true,
    imports: [MatInputModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSelectModule, TotalTimeUpdateDirective, TimePickerComponent],
    templateUrl: './employee-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeEditComponent implements OnInit {
    employee = input.required<DashboardEmployee>();
    formCreated = output<FormGroup>();
    form!: FormGroup;
    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

    displayedColumns: string[] = ['name', 'clockInTime', 'clockOutTime', 'totalTime'];

    get shifts() {
        return (this.form.get('shifts') as FormArray)?.controls ?? [];
    }

    shiftsDataSource!: MatTableDataSource<AbstractControl<any>>;
    dates = new Set<string>();
    selectedFilter: string | null = null;
    private formFactory = inject(DashboardEmployeeFormFactoryService);
    private shiftService = inject(ShiftService);

    ngOnInit(): void {
        this.form = this.formFactory.create(this.employee());
        this.getShiftsForEmployee();
        this.formCreated.emit(this.form);
    }

    applyFilter(filterValue: string | null) {
        if (!filterValue) {
            return;
        }
        this.shiftsDataSource.filterPredicate = (data, filter) => data.get('date')?.value === filter;
        this.shiftsDataSource.filter = filterValue?.trim().toLowerCase();
    }

    private getShiftsForEmployee(): void {
        this.shiftService.getShiftsForEmployee(this.employee().id).subscribe((shifts) => {
            this.formFactory.createShiftsArray(this.form, shifts);
            this.shiftsDataSource = new MatTableDataSource<AbstractControl<any>>(this.shifts);
            this.setDatesForFilter();
            this.shiftsDataSource.paginator = this.paginator;
        });
    }

    private setDatesForFilter(): void{
        this.shifts.forEach((shift) => this.dates.add(shift.get('date')?.value));
        this.selectedFilter = Array.from(this.dates).shift() ?? null;
        this.applyFilter(this.selectedFilter);
    }
}

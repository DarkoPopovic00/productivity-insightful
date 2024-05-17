import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, ViewChild, computed, inject, input, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { BulkSaveService } from '../../services/bulk-save.service';
import { BulkEditDialogComponent } from '../bulk-edit-dialog/bulk-edit-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-employee-list',
    standalone: true,
    imports: [MatTableModule, MatCheckboxModule, CurrencyPipe, DecimalPipe, MatPaginatorModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './employee-list.component.html',
    styleUrls: [`./employee-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent {
    employees = input<DashboardEmployee[]>([]);
    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

    displayedColumns: string[] = ['select', 'name', 'email', 'totalClockedInTime', 'totalAmountPaidForRegularHours', 'totalAmountPaidForOvertimeHours'];
    dataSource = computed(() => {
        this.selection.clear();
        const dataSource = new MatTableDataSource<DashboardEmployee>(this.employees());
        dataSource.paginator = this.paginator;
        return dataSource;
    });
    selection = new SelectionModel<DashboardEmployee>(true, []);
    get isAnyRowSelected(): boolean {
        return this.selection.selected.length > 0;
    }

    isSaveInProgress = signal(false);

    private dialog = inject(MatDialog);
    private bulkSaveService = inject(BulkSaveService);
    private matSnackbar = inject(MatSnackBar);

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.getItemsOnActivePage().length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.selection.select(...this.getItemsOnActivePage());
    }

    checkboxLabel(row?: DashboardEmployee): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
    }

    onBulkEditClicked(): void {
        const dialogRef = this.dialog.open(BulkEditDialogComponent, {
            data: {
                employees: this.selection.selected,
            },
            width: '80vw',
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.isSaveInProgress.set(true);
            if (result.action === 'save' && result.data.length > 0) {
                this.bulkSaveService.save(result.data).subscribe({
                    next: () => {
                        this.matSnackbar.open('Saved successfully!', 'close', { duration: 3000});
                    },
                    error: () => {
                        this.matSnackbar.open('Saved failed!', 'close', { duration: 3000});
                    },
                    complete: () => {
                        this.isSaveInProgress.set(false);
                    },
                });
            }
        });
    }

    private getItemsOnActivePage(): DashboardEmployee[] {
        return this.dataSource().data.slice(
            this.paginator.pageIndex * this.paginator.pageSize,
            this.paginator.pageIndex * this.paginator.pageSize + this.paginator.pageSize
        );
    }
}

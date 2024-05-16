import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TableComponent } from './components/table/table.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { BulkEditDialogComponent } from './components/bulk-edit-dialog/bulk-edit-dialog.component';
import { DashboardService } from './services/dashboard.service';
import { DashboardEmployee } from './models/dashboard-employee';
import { BulkSaveService } from './services/bulk-save.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [AsyncPipe, MatCardModule, DecimalPipe, CurrencyPipe, TableComponent, MatButtonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    providers: [DashboardService, BulkSaveService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    dashboardInformation = toSignal(this.dashboardService.dashboardInformation$);
    dashboardEmployees = toSignal(this.dashboardService.dashboardEmployees$);
    selectedRows: DashboardEmployee[] = [];

    constructor(private dashboardService: DashboardService, public dialog: MatDialog, private bulkSaveService: BulkSaveService) {
        this.dashboardService.init();
    }

    onBulkEditClicked(): void {
        const dialogRef = this.dialog.open(BulkEditDialogComponent, {
            data: {
                employees: this.selectedRows,
            },
            width: '80vw',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.action === 'save' && result.data.length > 0) {
              this.bulkSaveService.save(result.data).subscribe()
            }
        });
    }

    rowSelectionChanged(rows: DashboardEmployee[]): void {
        this.selectedRows = rows;
    }
}

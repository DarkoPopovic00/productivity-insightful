import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DashboardStateService } from './services/dashboard-state.service';
import { BulkSaveService } from './services/bulk-save.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [AsyncPipe, MatCardModule, DecimalPipe, CurrencyPipe, EmployeeListComponent, MatButtonModule],
    templateUrl: './dashboard.component.html',
    providers: [DashboardStateService, BulkSaveService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    dashboardInformation = toSignal(this.dashboardService.dashboardInformation$);
    dashboardEmployees = toSignal(this.dashboardService.dashboardEmployees$);

    constructor(private dashboardService: DashboardStateService, public dialog: MatDialog) {
        this.dashboardService.init();
    }
}

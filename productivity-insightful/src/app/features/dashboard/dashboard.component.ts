import { Component } from '@angular/core';
import {
  EmployeeService,
  ShiftService,
} from '../../shared/data-access/http-services';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TableComponent } from './components/table/table.component';
import { DashboardService } from '../../shared/data-access';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    DecimalPipe,
    CurrencyPipe,
    TableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  data = toSignal(this.dashboardService.getData());

  constructor(private dashboardService: DashboardService) {}
}

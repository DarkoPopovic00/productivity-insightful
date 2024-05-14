import { SelectionModel } from '@angular/cdk/collections';
import { Component, computed, input } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DashboardEmployee } from '../../../../shared/data-access';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, CurrencyPipe, DecimalPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  employees = input<DashboardEmployee[]>([]);
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'totalClockedInTime',
    'totalAmountPaidForRegularHours',
    'totalOvertimeAmountPaid',
  ];
  dataSource = computed(() =>  new MatTableDataSource<DashboardEmployee>(this.employees()));
  selection = new SelectionModel<DashboardEmployee>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource().data);
  }

  checkboxLabel(row?: DashboardEmployee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}

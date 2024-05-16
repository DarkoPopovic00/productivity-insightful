import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardEmployee } from '../../models/dashboard-employee';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, CurrencyPipe, DecimalPipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  employees = input<DashboardEmployee[]>([]);
  rowSelectionChanged = output<DashboardEmployee[]>();
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'totalClockedInTime',
    'totalAmountPaidForRegularHours',
    'totalOvertimeAmountPaid',
  ];
  dataSource = computed(
    () => new MatTableDataSource<DashboardEmployee>(this.employees())
  );
  selection = new SelectionModel<DashboardEmployee>(true, []);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.selection.changed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.rowSelectionChanged.emit(this.selection.selected));
  }

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
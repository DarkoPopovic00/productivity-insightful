import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeEditComponent } from '../employee-edit/employee-edit.component';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { FormGroup } from '@angular/forms';

export interface BulkEditDialogData {
  employees: DashboardEmployee[];
}

@Component({
  selector: 'app-bulk-edit-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, EmployeeEditComponent],
  templateUrl: './bulk-edit-dialog.component.html',
  styleUrl: './bulk-edit-dialog.component.scss',
})
export class BulkEditDialogComponent {
  private allForms: FormGroup[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: BulkEditDialogData) {}

  onFormCreated(form: FormGroup): void {
    this.allForms.push(form);
  }

  onSaveClicked(): void {
    const changedForms = this.allForms.filter(f => f.dirty);
    console.log(changedForms);

  }
}

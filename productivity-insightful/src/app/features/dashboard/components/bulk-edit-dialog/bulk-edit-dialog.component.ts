import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeEditComponent } from '../employee-edit/employee-edit.component';
import { DashboardEmployee } from '../../models/dashboard-employee';
import { FormGroup } from '@angular/forms';
import { BulkSaveFactoryService } from '../../services/bulk-save-factory.service';

export interface BulkEditDialogData {
    employees: DashboardEmployee[];
}

@Component({
    selector: 'app-bulk-edit-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, EmployeeEditComponent],
    templateUrl: './bulk-edit-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEditDialogComponent {
    private allForms: FormGroup[] = [];
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: BulkEditDialogData,
        private bulkSaveService: BulkSaveFactoryService,
        public dialogRef: MatDialogRef<BulkEditDialogComponent>
    ) {}

    onFormCreated(form: FormGroup): void {
        this.allForms.push(form);
    }

    onSaveClicked(): void {
        if(this.isAnyFormInvalid()) {
            return;
        }
        
        const changedForms = this.allForms.filter((f) => f.dirty);
        const data = this.bulkSaveService.create(this.data.employees, changedForms);
        this.dialogRef.close({ action: 'save', data });
    }

    isAnyFormInvalid(): boolean {
        return this.allForms.some(f => f.invalid);
    }
}

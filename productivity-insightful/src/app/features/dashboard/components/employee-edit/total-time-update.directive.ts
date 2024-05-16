import { DestroyRef, Directive, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup } from '@angular/forms';
import { combineLatest, startWith, tap } from 'rxjs';
import { DateHelperService } from '../../../../shared';

@Directive({ selector: '[appTotalTimeUpdate]', standalone: true })
export class TotalTimeUpdateDirective implements OnInit {
    @Input({ required: true, alias: 'appTotalTimeUpdate' }) formGroup!: FormGroup;
    private dateHelperService = inject(DateHelperService);

    get clockInTimeControl() {
        return this.formGroup.get('clockInTime') as AbstractControl;
    }

    get clockOutTimeControl() {
        return this.formGroup.get('clockOutTime') as AbstractControl;
    }

    get dateControl() {
        return this.formGroup.get('date') as AbstractControl;
    }

    get totalTimeControl() {
        return this.formGroup.get('totalTime') as AbstractControl;
    }

    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        combineLatest([
            this.clockInTimeControl?.valueChanges.pipe(startWith(this.clockInTimeControl?.value)),
            this.clockOutTimeControl?.valueChanges.pipe(startWith(this.clockOutTimeControl?.value)),
        ])
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                tap(([clockIn, clockOut]: [Date, Date]) => {
                    const totalTime = this.dateHelperService.convertSecondsToTime((clockOut.getTime() - clockIn.getTime()) / 1000);
                    this.totalTimeControl.setValue(totalTime);
                })
            )
            .subscribe();
    }
}

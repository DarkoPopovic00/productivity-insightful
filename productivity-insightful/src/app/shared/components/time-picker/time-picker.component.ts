import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BaseControlValueAccessor } from '../base-control-value-accessor';
import { MatFormFieldModule } from '@angular/material/form-field';

function toDate(value: string | Date | number): Date {
  return new Date(value);
};

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [MatInputModule, FormsModule, MatFormFieldModule],
  templateUrl: './time-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TimePickerComponent),
        multi: true,
    },
],
})
export class TimePickerComponent  extends BaseControlValueAccessor<Date>{

  get time(): string {
    if(!this.value) {
      return '00:00';
    }
    return `${this.value?.getHours().toString().padStart(2, '0')}:${this.value?.getMinutes().toString().padStart(2, '0')}`
  }

  onModelChange(time: string) {
    if(!this.value){
      return;
    }
    const newValue = new Date(this.value);
    newValue?.setHours(this.getHours(time));
    newValue?.setMinutes(this.getMinutes(time));
    this.value = newValue;
  }

  private getHours(time:string): number {
    return Number(time.split(':')[0]);
  }

  private getMinutes(time:string): number {
    return Number(time.split(':')[1]);
  }
}

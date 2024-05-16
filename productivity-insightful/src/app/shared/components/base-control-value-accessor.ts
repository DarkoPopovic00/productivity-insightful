import { ChangeDetectorRef, Directive, Input, inject } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export class BaseControlValueAccessor<T> implements ControlValueAccessor{
    val: T | null  = null;
    notTrimmedVal = '';
    @Input() disabled = false;
    protected cdr = inject(ChangeDetectorRef);

    onChange: any = (_: any) => { };
    onTouch: any = () => { };

    @Input() set value(val: T | null) {
      if (val !== undefined && this.val !== val) {
        if(typeof(val) === 'string') {
          this.val = val.trim() as T;
          this.notTrimmedVal = val;
        } else {
          this.val = val;
        }
  
        this.onChange(this.val);
        this.onTouch(this.val);
      }
    }
  
    get value(): T | null {
      return this.val;
    }

    writeValue(obj: T) {
      this.value = obj;
      this.cdr.markForCheck();
    }
  
    registerOnChange(fn: () => void) {
      this.onChange = fn;
    }
  
    registerOnTouched(fn: any) {
      this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
      this.cdr.markForCheck();
    }
}
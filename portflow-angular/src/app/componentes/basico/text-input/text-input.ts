import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  imports: [],
  templateUrl: './text-input.html',
  styleUrl: './text-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true,
    },
  ],
})
export class TextInput implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' | 'url' | 'number' = 'text';
  @Input() multiline = false;
  @Input() maxLength: number | null = null;
  @Input() autocomplete = 'off';

  value = '';
  isDisabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }
}

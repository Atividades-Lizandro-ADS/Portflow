import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-no-paste-input',
  imports: [],
  templateUrl: './no-paste-input.html',
  styleUrl: './no-paste-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NoPasteInput),
      multi: true,
    },
  ],
})
export class NoPasteInput implements ControlValueAccessor {
  placeholder = input('');
  type = input<'text' | 'password' | 'email' | 'url' | 'number'>('text');
  multiline = input(false);
  maxLength = input<number | null>(null);
  autocomplete = input('off');

  value = signal('');
  isDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}

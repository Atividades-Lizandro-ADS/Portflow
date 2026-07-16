import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (value.length < 6) errors['minlength'] = true;
    if (!/[a-zA-Z]/.test(value)) errors['requiresLetter'] = true;
    if (!/[0-9]/.test(value)) errors['requiresNumber'] = true;
    if (!/[^a-zA-Z0-9]/.test(value)) errors['requiresSymbol'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}

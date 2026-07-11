import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textSize',
})
export class TextSizePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 20): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return `${value.slice(0, limit)}...`;
  }
}

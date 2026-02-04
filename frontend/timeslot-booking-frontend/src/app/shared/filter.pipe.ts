import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, exists: boolean): any[] {
    if (!items) {
      return [];
    }
    
    if (exists) {
      return items.filter(item => item[field] !== null && item[field] !== undefined);
    } else {
      return items.filter(item => item[field] === null || item[field] === undefined);
    }
  }
}

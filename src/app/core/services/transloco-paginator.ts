import { DestroyRef, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Injectable()
export class TranslocoPaginatorIntlService extends MatPaginatorIntl {
 private transloco = inject(TranslocoService);
 private destroyRef = inject(DestroyRef);
 override itemsPerPageLabel = '';
 override nextPageLabel = '';
 override previousPageLabel = '';
 override firstPageLabel = '';
 override lastPageLabel = '';

 constructor() {
  super();

  const keys = [
   'common.paginator.itemsPerPageLabel',
   'common.paginator.nextPageLabel',
   'common.paginator.previousPageLabel',
   'common.paginator.firstPageLabel',
   'common.paginator.lastPageLabel'
  ];

  combineLatest(keys.map(key => this.transloco.selectTranslate(key)))
   .pipe(takeUntilDestroyed(this.destroyRef)) // auto unsubscribes
   .subscribe(([items, next, prev, first, last]) => {
    this.itemsPerPageLabel = items;
    this.nextPageLabel = next;
    this.previousPageLabel = prev;
    this.firstPageLabel = first;
    this.lastPageLabel = last;
    this.changes.next();
   });
 }

 override getRangeLabel = (page: number, pageSize: number, length: number): string => {
  if (length === 0 || pageSize === 0) {
   return `0 ${this.transloco.translate('common.paginator.ofLabel')} ${length}`;
  }
  length = Math.max(length, 0);
  const startIndex = page * pageSize;
  const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
  return `${startIndex + 1} – ${endIndex} ${this.transloco.translate('common.paginator.ofLabel')} ${length}`;
 };
}

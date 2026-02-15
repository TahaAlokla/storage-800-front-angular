import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Reusable pagination control component.
 * Displays pagination controls and emits events for page navigation.
 */
@Component({
  selector: 'app-pagination',
  imports: [TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  // Inputs
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly isLoading = input(false);
  readonly canGoPrevious = input(false);
  readonly canGoNext = input(false);
  readonly pageNumbers = input<number[]>([]);

  // Outputs
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
  readonly goToPage = output<number>();

  onPrevious(): void {
    if (!this.isLoading()) {
      this.previousPage.emit();
    }
  }

  onNext(): void {
    if (!this.isLoading()) {
      this.nextPage.emit();
    }
  }

  onGoToPage(pageNumber: number): void {
    if (!this.isLoading()) {
      this.goToPage.emit(pageNumber);
    }
  }

  trackByPageNumber(_index: number, pageNumber: number): number {
    return pageNumber;
  }
}

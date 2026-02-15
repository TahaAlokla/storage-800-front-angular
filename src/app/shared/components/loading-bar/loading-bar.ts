import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '@core/services/loading.service';
import { asapScheduler, map, observeOn } from 'rxjs';

@Component({
  selector: 'loading-bar',
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading-bar.html',
  styleUrl: './loading-bar.css',
})
export class LoadingBar {
  private readonly loadingService = inject(LoadingService);

  autoMode = input<boolean>(true);

  mode = toSignal(
    this.loadingService.mode$.pipe(observeOn(asapScheduler)),
    { initialValue: 'indeterminate' }
  );
  progress = toSignal(
    this.loadingService.progress$.pipe(
      map((value) => value ?? 0),
      observeOn(asapScheduler)
    ),
    { initialValue: 0 }
  );
  show = toSignal(
    this.loadingService.show$.pipe(observeOn(asapScheduler)),
    { initialValue: false }
  );

  constructor() {
    effect(() => {
      this.loadingService.setAutoMode(
        coerceBooleanProperty(this.autoMode())
      );
    });
  }
}


import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LangToggle } from '@shared/components/lang-toggle/lang-toggle';
import { LoadingBar } from '@shared/components/loading-bar/loading-bar';
import { ThemeToggle } from '@shared/components/theme-toggle/theme-toggle';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingBar, ThemeToggle, LangToggle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('storage-800-front-angular-task');
 

  
}

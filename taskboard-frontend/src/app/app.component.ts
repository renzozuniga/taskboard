import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component.
 * Renders the active route via RouterOutlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class AppComponent {
  title = 'TaskBoard';
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

/**
 * Top navigation bar for the board view.
 * Mapped from Figma: Components / Organisms / Top Bar
 *
 * @param boardTitle - Title of the current board
 * @param userName - Current user's name (for avatar)
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <h2 class="topbar__title">{{ boardTitle }}</h2>
      </div>

      <div class="topbar__center">
        <div class="topbar__search">
          <svg class="topbar__search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            class="topbar__search-input"
            placeholder="Search tasks..."
            (input)="onSearch($event)"
          />
        </div>
      </div>

      <div class="topbar__right">
        <button class="topbar__icon-btn" (click)="notifications.emit()" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 7A5 5 0 005 7c0 5.25-2 6.5-2 6.5h14s-2-1.25-2-6.5zM8.5 16.5a1.75 1.75 0 003 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <app-avatar [name]="userName" size="small" />
      </div>
    </header>
  `,
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Input() boardTitle = '';
  @Input() userName = '';
  @Output() searchChanged = new EventEmitter<string>();
  @Output() notifications = new EventEmitter<void>();

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChanged.emit(target.value);
  }
}

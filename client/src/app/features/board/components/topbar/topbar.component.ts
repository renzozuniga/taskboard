import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

/**
 * Top navigation bar for the board and dashboard views.
 * Mapped from Figma: Components / Organisms / Top Bar
 *
 * @param boardTitle - Title of the current page/board
 * @param userName - Current user's name (for avatar)
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <h2 class="topbar__title">{{ boardTitle }}</h2>
      </div>

      <div class="topbar__center">
        <div class="topbar__search" [class.topbar__search--active]="searchValue.length > 0">
          <svg class="topbar__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            #searchInput
            type="text"
            class="topbar__search-input"
            placeholder="Search..."
            [(ngModel)]="searchValue"
            (input)="onSearch()"
          />
          <button
            *ngIf="searchValue.length > 0"
            class="topbar__search-clear"
            (click)="clearSearch(searchInput)"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="topbar__right">
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

  searchValue = '';

  onSearch(): void {
    this.searchChanged.emit(this.searchValue);
  }

  clearSearch(input: HTMLInputElement): void {
    this.searchValue = '';
    this.searchChanged.emit('');
    input.focus();
  }
}

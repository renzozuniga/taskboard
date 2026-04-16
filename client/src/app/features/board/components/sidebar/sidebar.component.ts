import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

/**
 * Main navigation sidebar component.
 * Mapped from Figma: Components / Organisms / Sidebar
 *
 * @param userName - Current user's display name
 * @param userEmail - Current user's email
 * @param boards - List of boards to display in navigation
 * @param activeBoardId - ID of the currently active board
 * @param activeSection - Highlights 'dashboard' or 'board' in the nav
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar__logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#2563EB"/>
          <path d="M7 8h10M7 12h6M7 16h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="sidebar__logo-text">TaskBoard</span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar__nav">
        <a
          class="sidebar__nav-item"
          [class.sidebar__nav-item--active]="activeSection === 'dashboard'"
          routerLink="/dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          Dashboard
        </a>
      </nav>

      <!-- Boards Section -->
      <div class="sidebar__section">
        <div class="sidebar__section-header">
          <span class="sidebar__section-title">My Boards</span>
          <button class="sidebar__add-btn" (click)="createBoard.emit()" aria-label="Create board">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="sidebar__boards-list">
          <a
            *ngFor="let board of boards"
            class="sidebar__board-item"
            [class.sidebar__board-item--active]="board.id === activeBoardId"
            [routerLink]="['/board', board.id]"
          >
            <span class="sidebar__board-dot" [style.background-color]="board.color"></span>
            <span class="sidebar__board-name">{{ board.name }}</span>
          </a>
        </div>
      </div>

      <!-- User Section with dropdown menu -->
      <div class="sidebar__user-wrapper">
        <!-- Dropdown menu — appears above the user area -->
        <div *ngIf="isUserMenuOpen" class="sidebar__user-menu">
          <div class="sidebar__user-menu-info">
            <span class="sidebar__user-menu-name">{{ userName }}</span>
            <span class="sidebar__user-menu-email">{{ userEmail }}</span>
          </div>
          <div class="sidebar__user-menu-divider"></div>
          <button class="sidebar__user-menu-item" (click)="onLogout()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>

        <!-- Clickable user area -->
        <button class="sidebar__user" (click)="toggleUserMenu($event)">
          <app-avatar [name]="userName" size="small" />
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ userName }}</span>
            <span class="sidebar__user-email">{{ userEmail }}</span>
          </div>
          <svg
            class="sidebar__user-chevron"
            [class.sidebar__user-chevron--open]="isUserMenuOpen"
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M3 9l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() userName = '';
  @Input() userEmail = '';
  @Input() boards: Array<{ id: string; name: string; color: string }> = [];
  @Input() activeBoardId = '';
  @Input() activeSection = '';
  @Output() createBoard = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  isUserMenuOpen = false;

  /** Close the dropdown when clicking anywhere outside the sidebar user area. */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onLogout(): void {
    this.isUserMenuOpen = false;
    this.logout.emit();
  }
}

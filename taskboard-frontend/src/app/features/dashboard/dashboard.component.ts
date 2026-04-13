import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../board/components/sidebar/sidebar.component';
import { TopbarComponent } from '../board/components/topbar/topbar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

/**
 * Dashboard page showing all boards as cards in a grid.
 * Mapped from Figma: Desktop Screens / Dashboard
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ButtonComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar
        [userName]="currentUser.name"
        [userEmail]="currentUser.email"
        [boards]="boards"
        activeBoardId=""
        activeSection="dashboard"
        (createBoard)="onCreateBoard()"
      />

      <div class="dashboard-main">
        <app-topbar
          boardTitle="Dashboard"
          [userName]="currentUser.name"
        />

        <div class="dashboard-content">
          <!-- Header -->
          <div class="dashboard-header">
            <h2 class="dashboard-header__title">My Boards</h2>
            <app-button variant="primary" size="default" (clicked)="onCreateBoard()">
              + New Board
            </app-button>
          </div>

          <!-- Boards Grid -->
          <div class="boards-grid">
            <a
              *ngFor="let board of boards"
              [routerLink]="['/board', board.id]"
              class="board-card"
              [style.background-color]="board.color"
            >
              <span class="board-card__name">{{ board.name }}</span>
              <span class="board-card__count">{{ board.taskCount }} tasks</span>
            </a>

            <!-- Create New Board card -->
            <button class="board-card board-card--new" (click)="onCreateBoard()">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 8v16M8 16h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>Create new board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  currentUser = { name: 'Renzo Zuniga', email: 'renzo.zuniga@pucp.edu.pe' };

  boards = [
    { id: 'board-1', name: 'TaskBoard Demo',  color: '#2563EB', taskCount: 8 },
    { id: 'board-2', name: 'Personal Tasks',  color: '#059669', taskCount: 3 },
    { id: 'board-3', name: 'MAO Systems',     color: '#D97706', taskCount: 12 }
  ];

  onCreateBoard(): void {
    console.log('Create board');
  }
}

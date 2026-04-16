import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../board/components/sidebar/sidebar.component';
import { TopbarComponent } from '../board/components/topbar/topbar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { BoardService } from '../../core/services/board.service';
import { ApiBoard } from '../../core/models/board.model';

/** Fixed color palette assigned to boards by position (backend has no color field). */
const BOARD_COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#BE185D', '#B45309'];

interface SidebarBoard {
  id: string;
  name: string;
  description: string;
  color: string;
}

/**
 * Dashboard page showing all boards as cards in a grid.
 * Supports create, edit, and delete operations for boards.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SidebarComponent,
    TopbarComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    AvatarComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar
        [userName]="currentUser.name"
        [userEmail]="currentUser.email"
        [boards]="sidebarBoards"
        activeBoardId=""
        activeSection="dashboard"
        (createBoard)="onCreateBoard()"
        (logout)="onLogout()"
      />

      <div class="dashboard-main">
        <app-topbar
          boardTitle="Dashboard"
          [userName]="currentUser.name"
          (searchChanged)="onSearch($event)"
        />

        <div class="dashboard-content">
          <div class="dashboard-header">
            <div class="dashboard-header__left">
              <h2 class="dashboard-header__title">My Boards</h2>
              <span *ngIf="searchQuery" class="dashboard-header__count">
                {{ filteredBoards.length }} result{{ filteredBoards.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <app-button variant="primary" (clicked)="onCreateBoard()">+ New Board</app-button>
          </div>

          <div *ngIf="isLoading" class="dashboard-loading">Loading boards...</div>

          <div *ngIf="!isLoading && filteredBoards.length === 0 && searchQuery" class="dashboard-empty">
            No boards match "{{ searchQuery }}"
          </div>

          <div *ngIf="!isLoading && !(filteredBoards.length === 0 && searchQuery)" class="boards-grid">
            <!-- Board cards -->
            <a
              *ngFor="let board of filteredBoards"
              [routerLink]="['/board', board.id]"
              class="board-card"
              [style.background-color]="board.color"
            >
              <!-- Top: title + action buttons -->
              <div class="board-card__header">
                <span class="board-card__name">{{ board.name }}</span>
                <div class="board-card__actions">
                  <button
                    class="board-card__action-btn"
                    (click)="onEditBoard(board, $event)"
                    aria-label="Edit board"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 1.5a1.414 1.414 0 012 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button
                    class="board-card__action-btn board-card__action-btn--danger"
                    (click)="onDeleteBoard(board, $event)"
                    aria-label="Delete board"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3.5 3.5l.5 7h6l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Bottom: owner -->
              <div class="board-card__footer">
                <app-avatar [name]="currentUser.name" size="small" />
                <span class="board-card__owner-name">{{ currentUser.name }}</span>
              </div>
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

    <!-- Create / Edit Board Modal -->
    <app-modal
      [isOpen]="isBoardModalOpen"
      [title]="isEditingBoard ? 'Edit Board' : 'New Board'"
      (closed)="isBoardModalOpen = false"
    >
      <form [formGroup]="boardForm" (ngSubmit)="onSubmitBoard()" class="modal-form">
        <app-input
          label="Board Title"
          placeholder="e.g. Marketing Campaign"
          formControlName="title"
          [error]="boardTitleError"
        />
        <div class="modal-form__field">
          <label class="modal-form__label">Description <span class="modal-form__optional">(optional)</span></label>
          <textarea
            class="modal-form__textarea"
            placeholder="What is this board for?"
            rows="3"
            formControlName="description"
          ></textarea>
        </div>
      </form>
      <div modal-footer>
        <app-button variant="secondary" (clicked)="isBoardModalOpen = false">Cancel</app-button>
        <app-button variant="primary" (clicked)="onSubmitBoard()" [disabled]="isSubmittingBoard">
          {{ isSubmittingBoard ? 'Saving...' : (isEditingBoard ? 'Save Changes' : 'Create Board') }}
        </app-button>
      </div>
    </app-modal>

    <!-- Delete Confirmation Modal -->
    <app-modal
      [isOpen]="isDeleteConfirmOpen"
      title="Delete Board"
      (closed)="isDeleteConfirmOpen = false"
    >
      <p class="delete-confirm__text">
        Are you sure you want to delete <strong>{{ selectedBoardName }}</strong>?
        This will permanently remove all its columns and cards.
      </p>
      <div modal-footer>
        <app-button variant="secondary" (clicked)="isDeleteConfirmOpen = false">Cancel</app-button>
        <app-button variant="danger" (clicked)="onConfirmDelete()" [disabled]="isSubmittingBoard">
          {{ isSubmittingBoard ? 'Deleting...' : 'Delete Board' }}
        </app-button>
      </div>
    </app-modal>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: AuthUser = { id: '', name: '', email: '' };
  sidebarBoards: SidebarBoard[] = [];
  filteredBoards: SidebarBoard[] = [];
  searchQuery = '';
  isLoading = false;

  // Board create/edit modal
  isBoardModalOpen = false;
  isEditingBoard = false;
  isSubmittingBoard = false;
  boardForm: FormGroup;

  // Delete confirmation modal
  isDeleteConfirmOpen = false;
  selectedBoardId = '';
  selectedBoardName = '';

  constructor(
    private authService: AuthService,
    private boardService: BoardService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.boardForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() ?? { id: '', name: '', email: '' };
    this.loadBoards();
  }

  get boardTitleError(): string {
    const ctrl = this.boardForm.get('title');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Board title is required.';
    if (ctrl.hasError('maxlength')) return 'Title cannot exceed 100 characters.';
    return '';
  }

  // ── Board modal ───────────────────────────────────────────

  onCreateBoard(): void {
    this.isEditingBoard = false;
    this.boardForm.reset();
    this.isBoardModalOpen = true;
  }

  onEditBoard(board: SidebarBoard, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditingBoard = true;
    this.selectedBoardId = board.id;
    this.boardForm.setValue({ title: board.name, description: board.description });
    this.isBoardModalOpen = true;
  }

  onSubmitBoard(): void {
    if (this.boardForm.invalid) {
      this.boardForm.markAllAsTouched();
      return;
    }

    this.isSubmittingBoard = true;
    const { title, description } = this.boardForm.value;

    if (this.isEditingBoard) {
      this.boardService.updateBoard(this.selectedBoardId, title, description).subscribe({
        next: (updated) => {
          this.sidebarBoards = this.sidebarBoards.map(b =>
            b.id === updated._id ? { ...b, name: updated.title, description: updated.description } : b
          );
          this.filteredBoards = this.sidebarBoards;
          this.isBoardModalOpen = false;
          this.isSubmittingBoard = false;
        },
        error: () => { this.isSubmittingBoard = false; }
      });
    } else {
      this.boardService.createBoard(title, description).subscribe({
        next: (board) => {
          this.isSubmittingBoard = false;
          this.isBoardModalOpen = false;
          this.router.navigate(['/board', board._id]);
        },
        error: () => { this.isSubmittingBoard = false; }
      });
    }
  }

  // ── Delete confirmation ───────────────────────────────────

  onDeleteBoard(board: SidebarBoard, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedBoardId = board.id;
    this.selectedBoardName = board.name;
    this.isDeleteConfirmOpen = true;
  }

  onConfirmDelete(): void {
    this.isSubmittingBoard = true;
    this.boardService.deleteBoard(this.selectedBoardId).subscribe({
      next: () => {
        this.sidebarBoards = this.sidebarBoards.filter(b => b.id !== this.selectedBoardId);
        this.filteredBoards = this.sidebarBoards;
        this.isDeleteConfirmOpen = false;
        this.isSubmittingBoard = false;
      },
      error: () => { this.isSubmittingBoard = false; }
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query.trim();
    const q = this.searchQuery.toLowerCase();
    this.filteredBoards = q
      ? this.sidebarBoards.filter(b => b.name.toLowerCase().includes(q))
      : this.sidebarBoards;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ── Private ───────────────────────────────────────────────

  private loadBoards(): void {
    this.isLoading = true;
    this.boardService.getBoards().subscribe({
      next: (boards) => {
        this.sidebarBoards = this.mapToSidebarBoards(boards);
        this.filteredBoards = this.sidebarBoards;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private mapToSidebarBoards(boards: ApiBoard[]): SidebarBoard[] {
    return boards.map((board, i) => ({
      id: board._id,
      name: board.title,
      description: board.description,
      color: BOARD_COLORS[i % BOARD_COLORS.length]
    }));
  }
}

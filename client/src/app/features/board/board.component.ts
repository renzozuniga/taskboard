import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { TaskColumnComponent, TaskDroppedEvent } from './components/task-column/task-column.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { Task } from './components/task-card/task-card.component';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { BoardService } from '../../core/services/board.service';
import { ListService } from '../../core/services/list.service';
import { CardService } from '../../core/services/card.service';
import { ApiBoard, ApiCard } from '../../core/models/board.model';

/** Fixed color palette assigned to boards by position (backend has no color field). */
const BOARD_COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#BE185D', '#B45309'];

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface SidebarBoard {
  id: string;
  name: string;
  color: string;
}

/**
 * Main board view page — Kanban board with columns and task cards.
 * Loads board data (lists + cards) from the API on init.
 * Handles create/edit/delete for both lists (columns) and cards (tasks).
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDropListGroup,
    SidebarComponent,
    TopbarComponent,
    TaskColumnComponent,
    ModalComponent,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <div class="board-layout">
      <app-sidebar
        [userName]="currentUser.name"
        [userEmail]="currentUser.email"
        [boards]="sidebarBoards"
        [activeBoardId]="boardId"
        activeSection="board"
        (createBoard)="onCreateBoard()"
        (logout)="onLogout()"
      />

      <div class="board-main">
        <app-topbar
          [boardTitle]="activeBoard.name"
          [userName]="currentUser.name"
          (searchChanged)="onSearch($event)"
        />

        <!-- Loading state -->
        <div *ngIf="isLoading" class="board-loading">
          Loading board...
        </div>

        <!-- Board Area (horizontal scroll) — cdkDropListGroup connects all child drop lists -->
        <div *ngIf="!isLoading" class="board-area" cdkDropListGroup>
          <app-task-column
            *ngFor="let column of filteredColumns; trackBy: trackByColumnId"
            [title]="column.title"
            [tasks]="column.tasks"
            [columnId]="column.id"
            [dragDisabled]="isSearching"
            (addTask)="onAddTask($event)"
            (taskClicked)="onTaskClicked($event)"
            (editColumn)="onEditColumn($event)"
            (deleteColumn)="onConfirmDeleteColumn($event)"
            (taskDropped)="onTaskDropped($event)"
          />

          <button class="board-area__add-column" (click)="onAddColumn()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Add column
          </button>
        </div>
      </div>
    </div>

    <!-- Task Modal (Create & Edit) -->
    <app-modal
      [isOpen]="isTaskModalOpen"
      [title]="isEditingTask ? 'Edit Card' : 'New Card'"
      (closed)="isTaskModalOpen = false"
    >
      <form [formGroup]="taskForm" (ngSubmit)="onSubmitTask()" class="task-form">
        <app-input
          label="Title"
          placeholder="Enter card title..."
          formControlName="title"
          [error]="taskTitleError"
        />
        <div class="task-form__field">
          <label class="task-form__label">Description</label>
          <textarea
            class="task-form__textarea"
            placeholder="Add a more detailed description..."
            rows="3"
            formControlName="description"
          ></textarea>
        </div>
        <div class="task-form__field">
          <label class="task-form__label">Assignee</label>
          <div class="task-form__assignee-picker">
            <button
              type="button"
              class="task-form__assignee-option"
              [class.task-form__assignee-option--active]="taskForm.get('assignee')?.value === ''"
              (click)="taskForm.get('assignee')?.setValue('')"
            >
              <div class="task-form__assignee-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </div>
              Sin asignar
            </button>
            <button
              type="button"
              class="task-form__assignee-option"
              [class.task-form__assignee-option--active]="taskForm.get('assignee')?.value === currentUser.name"
              (click)="taskForm.get('assignee')?.setValue(currentUser.name)"
            >
              <div class="task-form__assignee-avatar">{{ currentUserInitials }}</div>
              {{ currentUser.name }}
            </button>
          </div>
        </div>
      </form>
      <div modal-footer>
        <app-button
          *ngIf="isEditingTask"
          variant="danger"
          (clicked)="onDeleteTask()"
          [disabled]="isSubmittingTask"
        >
          Delete
        </app-button>
        <app-button variant="secondary" (clicked)="isTaskModalOpen = false">Cancel</app-button>
        <app-button variant="primary" (clicked)="onSubmitTask()" [disabled]="isSubmittingTask">
          {{ isSubmittingTask ? 'Saving...' : (isEditingTask ? 'Save Changes' : 'Create Card') }}
        </app-button>
      </div>
    </app-modal>

    <!-- Add Column Modal -->
    <app-modal
      [isOpen]="isAddColumnModalOpen"
      title="New Column"
      (closed)="isAddColumnModalOpen = false"
    >
      <form [formGroup]="columnForm" (ngSubmit)="onSubmitColumn()" class="task-form">
        <app-input
          label="Column Title"
          placeholder="e.g. In Progress"
          formControlName="title"
          [error]="columnTitleError"
        />
      </form>
      <div modal-footer>
        <app-button variant="secondary" (clicked)="isAddColumnModalOpen = false">Cancel</app-button>
        <app-button variant="primary" (clicked)="onSubmitColumn()" [disabled]="isSubmittingColumn">
          {{ isSubmittingColumn ? 'Creating...' : 'Create Column' }}
        </app-button>
      </div>
    </app-modal>

    <!-- Rename Column Modal -->
    <app-modal
      [isOpen]="isRenameColumnModalOpen"
      title="Rename Column"
      (closed)="isRenameColumnModalOpen = false"
    >
      <form [formGroup]="renameColumnForm" (ngSubmit)="onSubmitRenameColumn()" class="task-form">
        <app-input
          label="Column Title"
          placeholder="e.g. In Review"
          formControlName="title"
          [error]="renameColumnTitleError"
        />
      </form>
      <div modal-footer>
        <app-button variant="secondary" (clicked)="isRenameColumnModalOpen = false">Cancel</app-button>
        <app-button variant="primary" (clicked)="onSubmitRenameColumn()" [disabled]="isSubmittingColumn">
          {{ isSubmittingColumn ? 'Saving...' : 'Save' }}
        </app-button>
      </div>
    </app-modal>

    <!-- Delete Column Confirmation Modal -->
    <app-modal
      [isOpen]="isDeleteColumnConfirmOpen"
      title="Delete Column"
      (closed)="isDeleteColumnConfirmOpen = false"
    >
      <p class="delete-confirm__text">
        Are you sure you want to delete <strong>{{ deletingColumnTitle }}</strong>?
        All cards in this column will be permanently removed.
      </p>
      <div modal-footer>
        <app-button variant="secondary" (clicked)="isDeleteColumnConfirmOpen = false">Cancel</app-button>
        <app-button variant="danger" (clicked)="onDeleteColumn()" [disabled]="isSubmittingColumn">
          {{ isSubmittingColumn ? 'Deleting...' : 'Delete Column' }}
        </app-button>
      </div>
    </app-modal>
  `,
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // User
  currentUser: AuthUser = { id: '', name: '', email: '' };

  // Board state
  boardId = '';
  activeBoard = { name: '' };
  isLoading = false;

  // Columns data (mapped from API lists + cards)
  columns: Column[] = [];
  filteredColumns: Column[] = [];
  isSearching = false;

  // Sidebar
  sidebarBoards: SidebarBoard[] = [];

  // Task modal
  isTaskModalOpen = false;
  isEditingTask = false;
  isSubmittingTask = false;
  activeListId = '';
  selectedTaskId = '';
  taskForm: FormGroup;

  // Add column modal
  isAddColumnModalOpen = false;
  isSubmittingColumn = false;
  columnForm: FormGroup;

  // Rename column modal
  isRenameColumnModalOpen = false;
  renamingColumnId = '';
  renameColumnForm: FormGroup;

  // Delete column confirmation
  isDeleteColumnConfirmOpen = false;
  deletingColumnId = '';
  deletingColumnTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private boardService: BoardService,
    private listService: ListService,
    private cardService: CardService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      assignee: ['']
    });

    this.columnForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]]
    });

    this.renameColumnForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() ?? { id: '', name: '', email: '' };
    // Subscribe to route params so navigating board-to-board reloads the correct data
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.boardId = params.get('id') ?? '';
        this.isSearching = false;
        this.loadBoardData();
      });
  }

  /** Returns the first two initials of the current user's name (uppercase). */
  get currentUserInitials(): string {
    return this.currentUser.name
      .split(' ')
      .map(w => w.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // ── Computed error getters ────────────────────────────────

  get taskTitleError(): string {
    const ctrl = this.taskForm.get('title');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Title is required.';
    if (ctrl.hasError('maxlength')) return 'Title cannot exceed 200 characters.';
    return '';
  }

  get columnTitleError(): string {
    const ctrl = this.columnForm.get('title');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Column title is required.';
    if (ctrl.hasError('maxlength')) return 'Title cannot exceed 100 characters.';
    return '';
  }

  get renameColumnTitleError(): string {
    const ctrl = this.renameColumnForm.get('title');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Column title is required.';
    if (ctrl.hasError('maxlength')) return 'Title cannot exceed 100 characters.';
    return '';
  }

  // ── Event handlers ────────────────────────────────────────

  trackByColumnId(_: number, column: Column): string {
    return column.id;
  }

  onSearch(query: string): void {
    const q = query.trim().toLowerCase();
    this.isSearching = q.length > 0;
    if (!q) {
      this.filteredColumns = this.columns;
      return;
    }
    this.filteredColumns = this.columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.assignee?.name ?? '').toLowerCase().includes(q)
      )
    }));
  }

  onAddTask(listId: string): void {
    this.activeListId = listId;
    this.isEditingTask = false;
    this.taskForm.reset({ assignee: '' });
    this.isTaskModalOpen = true;
  }

  onTaskClicked(task: Task): void {
    this.selectedTaskId = task.id;
    this.isEditingTask = true;
    this.taskForm.setValue({
      title: task.title,
      description: task.description ?? '',
      assignee: task.assignee?.name ?? ''
    });
    this.isTaskModalOpen = true;
  }

  onSubmitTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmittingTask = true;
    const { title, description, assignee: assigneeName } = this.taskForm.value;
    const assignee: { name: string } | null = assigneeName ? { name: assigneeName as string } : null;

    if (this.isEditingTask) {
      this.cardService.updateCard(this.selectedTaskId, title, description, assignee).subscribe({
        next: (card) => this.applyCardUpdate(card),
        error: () => { this.isSubmittingTask = false; }
      });
    } else {
      this.cardService.createCard(title, description, this.activeListId, assignee).subscribe({
        next: (card) => this.applyCardCreate(card),
        error: () => { this.isSubmittingTask = false; }
      });
    }
  }

  onDeleteTask(): void {
    this.isSubmittingTask = true;
    this.cardService.deleteCard(this.selectedTaskId).subscribe({
      next: () => {
        this.columns = this.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => t.id !== this.selectedTaskId)
        }));
        this.filteredColumns = [...this.columns];
        this.isTaskModalOpen = false;
        this.isSubmittingTask = false;
      },
      error: () => { this.isSubmittingTask = false; }
    });
  }

  onAddColumn(): void {
    this.columnForm.reset();
    this.isAddColumnModalOpen = true;
  }

  onSubmitColumn(): void {
    if (this.columnForm.invalid) {
      this.columnForm.markAllAsTouched();
      return;
    }

    this.isSubmittingColumn = true;
    const { title } = this.columnForm.value;

    this.listService.createList(title, this.boardId).subscribe({
      next: (list) => {
        const newColumn: Column = { id: list._id, title: list.title, tasks: [] };
        this.columns = [...this.columns, newColumn];
        this.filteredColumns = [...this.columns];
        this.isAddColumnModalOpen = false;
        this.isSubmittingColumn = false;
      },
      error: () => { this.isSubmittingColumn = false; }
    });
  }

  onEditColumn(columnId: string): void {
    const col = this.columns.find(c => c.id === columnId);
    if (!col) return;
    this.renamingColumnId = columnId;
    this.renameColumnForm.reset({ title: col.title });
    this.isRenameColumnModalOpen = true;
  }

  onSubmitRenameColumn(): void {
    if (this.renameColumnForm.invalid) {
      this.renameColumnForm.markAllAsTouched();
      return;
    }
    this.isSubmittingColumn = true;
    const { title } = this.renameColumnForm.value;

    this.listService.updateList(this.renamingColumnId, title).subscribe({
      next: (list) => {
        this.columns = this.columns.map(col =>
          col.id === list._id ? { ...col, title: list.title } : col
        );
        this.filteredColumns = [...this.columns];
        this.isRenameColumnModalOpen = false;
        this.isSubmittingColumn = false;
      },
      error: () => { this.isSubmittingColumn = false; }
    });
  }

  onConfirmDeleteColumn(columnId: string): void {
    const col = this.columns.find(c => c.id === columnId);
    if (!col) return;
    this.deletingColumnId = columnId;
    this.deletingColumnTitle = col.title;
    this.isDeleteColumnConfirmOpen = true;
  }

  onDeleteColumn(): void {
    this.isSubmittingColumn = true;
    this.listService.deleteList(this.deletingColumnId).subscribe({
      next: () => {
        this.columns = this.columns.filter(col => col.id !== this.deletingColumnId);
        this.filteredColumns = [...this.columns];
        this.isDeleteColumnConfirmOpen = false;
        this.isSubmittingColumn = false;
      },
      error: () => { this.isSubmittingColumn = false; }
    });
  }

  /**
   * Persists a card move after CDK drag & drop updates the local arrays optimistically.
   * On API failure, reloads board data to restore a consistent state.
   * @param event - Contains the card ID, target list ID and new zero-based position
   */
  onTaskDropped(event: TaskDroppedEvent): void {
    this.filteredColumns = [...this.columns];
    this.cardService.moveCard(event.cardId, event.targetListId, event.newIndex).subscribe({
      error: () => this.loadBoardData()
    });
  }

  onCreateBoard(): void {
    this.router.navigate(['/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ── Private helpers ───────────────────────────────────────

  private loadBoardData(): void {
    this.isLoading = true;

    forkJoin({
      board: this.boardService.getBoardById(this.boardId),
      boards: this.boardService.getBoards()
    }).subscribe({
      next: ({ board, boards }) => {
        this.activeBoard = { name: board.title };
        this.columns = this.mapBoardToColumns(board);
        this.filteredColumns = [...this.columns];
        this.sidebarBoards = boards.map((b, i) => ({
          id: b._id,
          name: b.title,
          color: BOARD_COLORS[i % BOARD_COLORS.length]
        }));
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private mapBoardToColumns(board: ApiBoard): Column[] {
    return (board.lists ?? []).map(list => ({
      id: list._id,
      title: list.title,
      tasks: list.cards.map(card => this.mapCardToTask(card))
    }));
  }

  private mapCardToTask(card: ApiCard): Task {
    return {
      id: card._id,
      title: card.title,
      description: card.description,
      labels: [],
      assignee: card.assignee?.name ? { name: card.assignee.name } : undefined
    };
  }

  private applyCardCreate(card: ApiCard): void {
    this.columns = this.columns.map(col => {
      if (col.id !== this.activeListId) return col;
      return { ...col, tasks: [...col.tasks, this.mapCardToTask(card)] };
    });
    this.filteredColumns = [...this.columns];
    this.isTaskModalOpen = false;
    this.isSubmittingTask = false;
  }

  private applyCardUpdate(card: ApiCard): void {
    this.columns = this.columns.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === card._id ? this.mapCardToTask(card) : t)
    }));
    this.filteredColumns = [...this.columns];
    this.isTaskModalOpen = false;
    this.isSubmittingTask = false;
  }
}

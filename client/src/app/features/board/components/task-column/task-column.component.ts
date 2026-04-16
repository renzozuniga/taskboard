import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskCardComponent, Task } from '../task-card/task-card.component';

/** Emitted when a card is dropped, carrying the minimal info needed for the API call. */
export interface TaskDroppedEvent {
  cardId: string;
  targetListId: string;
  newIndex: number;
}

/**
 * Kanban column containing task cards with drag & drop support (Angular CDK).
 * Mapped from Figma: Components / Organisms / Task Column
 *
 * @param title - Column title (e.g. "To Do", "In Progress")
 * @param tasks - Array of tasks to display as cards
 * @param columnId - Used as the cdkDropList id (MongoDB ObjectId of the list)
 * @param dragDisabled - Set to true to disable drag (e.g. while search is active)
 */
@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, DragDropModule],
  template: `
    <div class="column">
      <!-- Column Header -->
      <div class="column__header">
        <div class="column__header-left">
          <h3 class="column__title">{{ title }}</h3>
          <span class="column__count">{{ tasks.length }}</span>
        </div>
        <div class="column__header-actions">
          <button class="column__action-btn" (click)="addTask.emit(columnId)" aria-label="Add task">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Three-dots menu button + dropdown -->
          <div class="column__menu-wrapper">
            <button
              class="column__action-btn"
              (click)="toggleMenu($event)"
              aria-label="Column menu"
              [class.column__action-btn--active]="isMenuOpen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1" fill="currentColor"/>
                <circle cx="8" cy="8" r="1" fill="currentColor"/>
                <circle cx="8" cy="13" r="1" fill="currentColor"/>
              </svg>
            </button>

            <div *ngIf="isMenuOpen" class="column__dropdown">
              <button class="column__dropdown-item" (click)="onEdit($event)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9.5 1.5a1.414 1.414 0 012 2L4 11H2V9l7.5-7.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Rename
              </button>
              <div class="column__dropdown-divider"></div>
              <button class="column__dropdown-item column__dropdown-item--danger" (click)="onDelete($event)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3.5 3.5l.5 7h6l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards Container (CDK drop zone) -->
      <div
        class="column__cards"
        cdkDropList
        [id]="columnId"
        [cdkDropListData]="tasks"
        [cdkDropListDisabled]="dragDisabled"
        (cdkDropListDropped)="onDrop($event)"
      >
        <app-task-card
          *ngFor="let task of tasks; trackBy: trackByTaskId"
          [task]="task"
          cdkDrag
          [cdkDragData]="task"
          (cardClicked)="taskClicked.emit($event)"
        />

        <!-- Empty state -->
        <div *ngIf="tasks.length === 0" class="column__empty">
          <p>No tasks yet</p>
        </div>
      </div>

      <!-- Add Card Button -->
      <button class="column__add-card" (click)="addTask.emit(columnId)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Add a card
      </button>
    </div>
  `,
  styleUrl: './task-column.component.css'
})
export class TaskColumnComponent {
  @Input() title = '';
  @Input() tasks: Task[] = [];
  @Input() columnId = '';
  @Input() dragDisabled = false;
  @Output() addTask = new EventEmitter<string>();
  @Output() taskClicked = new EventEmitter<Task>();
  @Output() editColumn = new EventEmitter<string>();
  @Output() deleteColumn = new EventEmitter<string>();
  @Output() taskDropped = new EventEmitter<TaskDroppedEvent>();

  isMenuOpen = false;

  /** Close the dropdown when clicking anywhere outside this component. */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = false;
    this.editColumn.emit(this.columnId);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = false;
    this.deleteColumn.emit(this.columnId);
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  /**
   * Handles a CDK drop event — updates the local arrays optimistically,
   * then emits taskDropped so the parent can persist the change via the API.
   * @param event - CdkDragDrop event containing source/target containers and indices
   */
  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const card = event.container.data[event.currentIndex];
    this.taskDropped.emit({
      cardId: card.id,
      targetListId: event.container.id,
      newIndex: event.currentIndex
    });
  }
}

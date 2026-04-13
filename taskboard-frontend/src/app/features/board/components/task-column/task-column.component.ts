import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent, Task } from '../task-card/task-card.component';

/**
 * Kanban column containing task cards with drag & drop support.
 * Mapped from Figma: Components / Organisms / Task Column
 *
 * @param title - Column title (e.g. "To Do", "In Progress")
 * @param tasks - Array of tasks to display as cards
 * @param columnId - Unique column identifier for drag & drop
 */
@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
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
          <button class="column__action-btn" (click)="menuClicked.emit(columnId)" aria-label="Column menu">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1" fill="currentColor"/>
              <circle cx="8" cy="8" r="1" fill="currentColor"/>
              <circle cx="8" cy="13" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Cards Container (drop zone for Angular CDK) -->
      <div class="column__cards">
        <app-task-card
          *ngFor="let task of tasks; trackBy: trackByTaskId"
          [task]="task"
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
  @Output() addTask = new EventEmitter<string>();
  @Output() taskClicked = new EventEmitter<Task>();
  @Output() menuClicked = new EventEmitter<string>();

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

/**
 * Individual task card displayed within a column.
 * Mapped from Figma: Components / Molecules / Task Card
 * Supports drag & drop via Angular CDK (added at board level).
 *
 * @param task - Task data object containing title, description, labels, assignee
 */
export interface TaskLabel {
  text: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'gray';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  labels: TaskLabel[];
  assignee?: { name: string; imageUrl?: string };
  dueDate?: string;
}

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, AvatarComponent],
  template: `
    <div class="task-card" (click)="cardClicked.emit(task)">

      <!-- Card top row: labels + drag handle -->
      <div class="task-card__top">
        <div class="task-card__labels" [class.task-card__labels--empty]="task.labels.length === 0">
          <app-badge
            *ngFor="let label of task.labels"
            [label]="label.text"
            [color]="label.color"
          />
        </div>
        <div class="task-card__grip" aria-hidden="true">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 1h10M1 5h10M1 9h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h4 class="task-card__title">{{ task.title }}</h4>

      <!-- Description preview -->
      <p *ngIf="task.description" class="task-card__description">
        {{ task.description }}
      </p>

      <!-- Footer: Due date + Assignee (always visible) -->
      <div class="task-card__footer">
        <span *ngIf="task.dueDate" class="task-card__due-date">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1.5" width="10" height="9.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 4.5h10M4 0.5v2M8 0.5v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          {{ task.dueDate }}
        </span>

        <!-- Assignee: avatar if assigned, placeholder if not -->
        <div class="task-card__assignee">
          <app-avatar
            *ngIf="task.assignee; else unassigned"
            [name]="task.assignee.name"
            [imageUrl]="task.assignee.imageUrl || ''"
            size="small"
          />
          <ng-template #unassigned>
            <div class="task-card__assignee-empty" title="Unassigned">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
                <path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() cardClicked = new EventEmitter<Task>();
}

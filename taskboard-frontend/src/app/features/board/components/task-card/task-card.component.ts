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
      <!-- Labels -->
      <div *ngIf="task.labels.length > 0" class="task-card__labels">
        <app-badge
          *ngFor="let label of task.labels"
          [label]="label.text"
          [color]="label.color"
        />
      </div>

      <!-- Title -->
      <h4 class="task-card__title">{{ task.title }}</h4>

      <!-- Description preview -->
      <p *ngIf="task.description" class="task-card__description">
        {{ task.description }}
      </p>

      <!-- Footer: Due date + Assignee -->
      <div class="task-card__footer">
        <span *ngIf="task.dueDate" class="task-card__due-date">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          {{ task.dueDate }}
        </span>
        <app-avatar
          *ngIf="task.assignee"
          [name]="task.assignee.name"
          [imageUrl]="task.assignee.imageUrl || ''"
          size="small"
        />
      </div>
    </div>
  `,
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() cardClicked = new EventEmitter<Task>();
}

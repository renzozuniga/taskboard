import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { TaskColumnComponent } from './components/task-column/task-column.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { Task } from './components/task-card/task-card.component';

/**
 * Main board view page — Kanban board with columns and task cards.
 * This is the primary screen of the TaskBoard application.
 * Layout: Sidebar (fixed left) + TopBar (sticky top) + Board area (scrollable).
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    TaskColumnComponent,
    ModalComponent,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <div class="board-layout">
      <!-- Sidebar -->
      <app-sidebar
        [userName]="currentUser.name"
        [userEmail]="currentUser.email"
        [boards]="boards"
        [activeBoardId]="activeBoardId"
        activeSection="board"
        (createBoard)="onCreateBoard()"
      />

      <!-- Main Content -->
      <div class="board-main">
        <app-topbar
          [boardTitle]="activeBoard.name"
          [userName]="currentUser.name"
          (searchChanged)="onSearch($event)"
        />

        <!-- Board Area (horizontal scroll) -->
        <div class="board-area">
          <app-task-column
            *ngFor="let column of columns; trackBy: trackByColumnId"
            [title]="column.title"
            [tasks]="column.tasks"
            [columnId]="column.id"
            (addTask)="onAddTask($event)"
            (taskClicked)="onTaskClicked($event)"
          />

          <!-- Add Column Button -->
          <button class="board-area__add-column" (click)="onAddColumn()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Add column
          </button>
        </div>
      </div>

      <!-- Task Modal -->
      <app-modal
        [isOpen]="isTaskModalOpen"
        [title]="isEditingTask ? 'Edit Task' : 'New Task'"
        (closed)="isTaskModalOpen = false"
      >
        <div class="task-form">
          <app-input label="Title" placeholder="Enter task title..." />
          <div class="task-form__field">
            <label class="task-form__label">Description</label>
            <textarea
              class="task-form__textarea"
              placeholder="Add a more detailed description..."
              rows="4"
            ></textarea>
          </div>
          <app-input label="Due Date" type="date" />
        </div>
        <div modal-footer>
          <app-button variant="secondary" (clicked)="isTaskModalOpen = false">Cancel</app-button>
          <app-button variant="primary">{{ isEditingTask ? 'Save Changes' : 'Create Task' }}</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styleUrl: './board.component.css'
})
export class BoardComponent {
  currentUser = { name: 'Renzo Zuniga', email: 'renzo.zuniga@pucp.edu.pe' };
  activeBoardId = 'board-1';
  activeBoard = { name: 'TaskBoard Demo', color: '#2563EB' };
  isTaskModalOpen = false;
  isEditingTask = false;

  boards = [
    { id: 'board-1', name: 'TaskBoard Demo', color: '#2563EB' },
    { id: 'board-2', name: 'Personal Tasks', color: '#059669' },
    { id: 'board-3', name: 'MAO Systems', color: '#D97706' }
  ];

  columns = [
    {
      id: 'col-1',
      title: 'To Do',
      tasks: [
        {
          id: 'task-1',
          title: 'Set up project repository',
          description: 'Initialize Angular project with proper folder structure',
          labels: [{ text: 'Setup', color: 'blue' as const }],
          assignee: { name: 'Renzo Zuniga' },
          dueDate: 'Apr 15'
        },
        {
          id: 'task-2',
          title: 'Design login screen in Figma',
          labels: [{ text: 'Design', color: 'amber' as const }],
          assignee: { name: 'Renzo Zuniga' },
          dueDate: 'Apr 16'
        }
      ]
    },
    {
      id: 'col-2',
      title: 'In Progress',
      tasks: [
        {
          id: 'task-3',
          title: 'Create Design System tokens',
          description: 'Define colors, typography, spacing in Figma and export to CSS variables',
          labels: [
            { text: 'Design', color: 'amber' as const },
            { text: 'Frontend', color: 'green' as const }
          ],
          assignee: { name: 'Renzo Zuniga' },
          dueDate: 'Apr 14'
        }
      ]
    },
    {
      id: 'col-3',
      title: 'Review',
      tasks: [
        {
          id: 'task-4',
          title: 'API authentication endpoints',
          description: 'JWT login and register routes with validation',
          labels: [{ text: 'Backend', color: 'red' as const }],
          assignee: { name: 'Renzo Zuniga' }
        }
      ]
    },
    {
      id: 'col-4',
      title: 'Done',
      tasks: [
        {
          id: 'task-5',
          title: 'Project planning document',
          labels: [{ text: 'Docs', color: 'gray' as const }],
          assignee: { name: 'Renzo Zuniga' }
        }
      ]
    }
  ];

  trackByColumnId(index: number, column: { id: string }): string {
    return column.id;
  }

  onSearch(query: string): void {
    console.log('Search:', query);
  }

  onAddTask(columnId: string): void {
    this.isEditingTask = false;
    this.isTaskModalOpen = true;
  }

  onTaskClicked(task: Task): void {
    this.isEditingTask = true;
    this.isTaskModalOpen = true;
  }

  onAddColumn(): void {
    console.log('Add column');
  }

  onCreateBoard(): void {
    console.log('Create board');
  }
}

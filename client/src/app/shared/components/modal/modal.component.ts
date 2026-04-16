import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable modal overlay component.
 * Mapped from Figma: Components / Molecules / Modal
 *
 * @param isOpen - Controls modal visibility
 * @param title - Modal header title
 * @param size - 'sm' (480px) | 'md' (560px)
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="modal-overlay"
      (click)="onOverlayClick($event)"
    >
      <div [class]="'modal modal--' + size" role="dialog" aria-modal="true">
        <div class="modal__header">
          <h3 class="modal__title">{{ title }}</h3>
          <button class="modal__close" (click)="close()" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal__body">
          <ng-content />
        </div>
        <div class="modal__footer">
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    </div>
  `,
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' = 'sm';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable button component with variant and size support.
 * Maps directly to Figma Design System Button component.
 *
 * @param variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param size - 'default' | 'small'
 * @param disabled - Whether the button is disabled
 * @param fullWidth - Whether the button takes full container width
 * @param type - HTML button type attribute
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'default' | 'small' = 'default';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return [
      'btn',
      `btn--${this.variant}`,
      `btn--${this.size}`,
      this.fullWidth ? 'btn--full' : '',
      this.disabled ? 'btn--disabled' : ''
    ].filter(Boolean).join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.clicked.emit(event);
    }
  }
}

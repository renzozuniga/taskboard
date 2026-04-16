import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Badge/Tag component for labels and status indicators.
 * Mapped from Figma: Components / Atoms / Badge
 *
 * @param label - Text displayed inside the badge
 * @param color - 'blue' | 'green' | 'amber' | 'red' | 'gray'
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge--' + color">{{ label }}</span>
  `,
  styleUrl: './badge.component.css'
})
export class BadgeComponent {
  @Input() label = '';
  @Input() color: 'blue' | 'green' | 'amber' | 'red' | 'gray' = 'blue';
}

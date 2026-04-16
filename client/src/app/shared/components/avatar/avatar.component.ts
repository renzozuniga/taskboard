import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Avatar component displaying user initials or image.
 * Mapped from Figma: Components / Atoms / Avatar
 *
 * @param name - User's full name (used to generate initials)
 * @param imageUrl - Optional URL for user's profile image
 * @param size - 'default' (40px) | 'small' (32px)
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'avatar avatar--' + size" [title]="name">
      <img
        *ngIf="imageUrl; else initialsTemplate"
        [src]="imageUrl"
        [alt]="name"
        class="avatar__image"
      />
      <ng-template #initialsTemplate>
        <span class="avatar__initials">{{ initials }}</span>
      </ng-template>
    </div>
  `,
  styleUrl: './avatar.component.css'
})
export class AvatarComponent {
  @Input() name = '';
  @Input() imageUrl = '';
  @Input() size: 'default' | 'small' = 'default';

  get initials(): string {
    return this.name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

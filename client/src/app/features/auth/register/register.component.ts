import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Register page component for new user sign-up.
 * Mapped from Figma: Desktop Screens / Register Screen
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <!-- Logo -->
        <div class="auth-card__logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#2563EB"/>
            <path d="M12 14h16M12 20h10M12 26h13" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <h1 class="auth-card__brand">TaskBoard</h1>
        </div>

        <h2 class="auth-card__title">Create your account</h2>
        <p class="auth-card__subtitle">Get started for free. No credit card required.</p>

        <!-- API error banner -->
        <div *ngIf="apiError" class="auth-error">{{ apiError }}</div>

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <app-input
            label="Full Name"
            type="text"
            placeholder="Renzo Zuniga"
            formControlName="name"
            [error]="nameError"
          />
          <app-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            formControlName="email"
            [error]="emailError"
          />
          <app-input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            formControlName="password"
            [error]="passwordError"
          />

          <app-button type="submit" variant="primary" [fullWidth]="true" [disabled]="isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </app-button>
        </form>

        <p class="auth-card__footer">
          Already have an account?
          <a routerLink="/login" class="auth-card__link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  apiError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get nameError(): string {
    const ctrl = this.registerForm.get('name');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Full name is required.';
    if (ctrl.hasError('minlength')) return 'Name must be at least 2 characters.';
    return '';
  }

  get emailError(): string {
    const ctrl = this.registerForm.get('email');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Email is required.';
    if (ctrl.hasError('email')) return 'Enter a valid email address.';
    return '';
  }

  get passwordError(): string {
    const ctrl = this.registerForm.get('password');
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Password is required.';
    if (ctrl.hasError('minlength')) return 'Password must be at least 6 characters.';
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.apiError = err.error?.message ?? 'An unexpected error occurred. Please try again.';
        this.isLoading = false;
      }
    });
  }
}

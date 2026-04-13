import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

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

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <app-input
            label="Full Name"
            type="text"
            placeholder="Renzo Zuniga"
            formControlName="name"
          />
          <app-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            formControlName="email"
          />
          <app-input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            formControlName="password"
          />

          <app-button type="submit" variant="primary" [fullWidth]="true">
            Create Account
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

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Register:', this.registerForm.value);
    }
  }
}

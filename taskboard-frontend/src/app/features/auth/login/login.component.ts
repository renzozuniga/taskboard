import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

/**
 * Login page component with email/password authentication.
 * Mapped from Figma: Desktop Screens / Login Screen
 */
@Component({
  selector: 'app-login',
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

        <h2 class="auth-card__title">Sign in to your account</h2>
        <p class="auth-card__subtitle">Welcome back! Enter your details below.</p>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <app-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            formControlName="email"
          />
          <app-input
            label="Password"
            type="password"
            placeholder="Enter your password"
            formControlName="password"
          />

          <div class="auth-form__options">
            <label class="auth-form__remember">
              <input type="checkbox" formControlName="remember" />
              <span>Remember me</span>
            </label>
            <a href="#" class="auth-form__forgot">Forgot password?</a>
          </div>

          <app-button type="submit" variant="primary" [fullWidth]="true">
            Sign In
          </app-button>
        </form>

        <p class="auth-card__footer">
          Don't have an account?
          <a routerLink="/register" class="auth-card__link">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login:', this.loginForm.value);
    }
  }
}

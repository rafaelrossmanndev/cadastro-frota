import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly formulario: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    senha: ['', [Validators.required]],
  });

  readonly carregando = signal(false);
  readonly senhaVisivel = signal(false);

  alternarVisibilidadeSenha(): void {
    this.senhaVisivel.update((visivel) => !visivel);
  }

  entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.formulario.disable();

    const { usuario, senha } = this.formulario.value;

    this.authService.login(usuario, senha).subscribe({
      next: (sucesso) => {
        this.carregando.set(false);
        this.formulario.enable();

        if (sucesso) {
          this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['snack-sucesso'],
          });
          this.router.navigate(['/motoristas']);
        } else {
          this.snackBar.open('Usuário ou senha incorretos.', 'Fechar', {
            duration: 4000,
            panelClass: ['snack-erro'],
          });
        }
      },
      error: () => {
        this.carregando.set(false);
        this.formulario.enable();
        this.snackBar.open('Erro ao tentar autenticar. Tente novamente.', 'Fechar', {
          duration: 4000,
        });
      },
    });
  }
}

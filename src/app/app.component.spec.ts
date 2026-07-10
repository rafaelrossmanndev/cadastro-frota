import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: signal(false),
      usuarioLogado: signal({ nome: 'Admin', cargo: 'Administrador' }),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navbar when authenticated', () => {
    mockAuthService.isAuthenticated.set(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barra-navegacao')).toBeTruthy();
  });
});

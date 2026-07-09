import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'motoristas' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'motoristas',
    loadComponent: () =>
      import('./components/lista-motoristas/lista-motoristas.component').then((m) => m.ListaMotoristasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'motoristas/novo',
    loadComponent: () =>
      import('./components/formulario-motorista/formulario-motorista.component').then(
        (m) => m.FormularioMotoristaComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'motoristas/:id/editar',
    loadComponent: () =>
      import('./components/formulario-motorista/formulario-motorista.component').then(
        (m) => m.FormularioMotoristaComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos',
    loadComponent: () =>
      import('./components/lista-veiculos/lista-veiculos.component').then((m) => m.ListaVeiculosComponent),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/novo',
    loadComponent: () =>
      import('./components/formulario-veiculo/formulario-veiculo.component').then(
        (m) => m.FormularioVeiculoComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'veiculos/:id/editar',
    loadComponent: () =>
      import('./components/formulario-veiculo/formulario-veiculo.component').then(
        (m) => m.FormularioVeiculoComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mapa',
    loadComponent: () =>
      import('./components/mapa/mapa.component').then((m) => m.MapaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'personalizacao',
    loadComponent: () =>
      import('./components/personalizacao/personalizacao.component').then(
        (m) => m.PersonalizacaoComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'motoristas' },
];


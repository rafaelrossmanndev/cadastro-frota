import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'motoristas' },
  {
    path: 'motoristas',
    loadComponent: () =>
      import('./components/lista-motoristas/lista-motoristas.component').then((m) => m.ListaMotoristasComponent),
  },
  {
    path: 'motoristas/novo',
    loadComponent: () =>
      import('./components/formulario-motorista/formulario-motorista.component').then(
        (m) => m.FormularioMotoristaComponent,
      ),
  },
  {
    path: 'motoristas/:id/editar',
    loadComponent: () =>
      import('./components/formulario-motorista/formulario-motorista.component').then(
        (m) => m.FormularioMotoristaComponent,
      ),
  },
  {
    path: 'veiculos',
    loadComponent: () =>
      import('./components/lista-veiculos/lista-veiculos.component').then((m) => m.ListaVeiculosComponent),
  },
  {
    path: 'veiculos/novo',
    loadComponent: () =>
      import('./components/formulario-veiculo/formulario-veiculo.component').then(
        (m) => m.FormularioVeiculoComponent,
      ),
  },
  {
    path: 'veiculos/:id/editar',
    loadComponent: () =>
      import('./components/formulario-veiculo/formulario-veiculo.component').then(
        (m) => m.FormularioVeiculoComponent,
      ),
  },
  { path: '**', redirectTo: 'motoristas' },
];

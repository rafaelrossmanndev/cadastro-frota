import { Marca } from '../models/branding.model';

/**
 * Marca ativa da aplicação (white label).
 *
 * Este é o ÚNICO arquivo que um cliente precisa editar para rebrand:
 * nome, logo, favicon, tagline e as três cores-base. Todos os demais tons
 * (hover, container, gradiente, variante escura) são derivados automaticamente.
 */
export const MARCA_PADRAO: Marca = {
  nome: 'Cadastro de Frota',
  nomeCurto: 'Frota',
  logoUrl: '/seu-logo-aqui.png',
  iconeFallback: 'directions_car',
  faviconUrl: 'favicon.ico',
  tagline: 'Sua marca, sua frota, seu controle.',
  loginTitulo: 'Gestão de Frota',
  cores: {
    primaria: '#2e6ef5',
    sucesso: '#26a269',
    perigo: '#e5484d',
  },
};

export type ModoTema = 'sistema' | 'claro' | 'escuro';

/** Cores-base da marca. Os demais tons são derivados via color-mix() no CSS. */
export interface CoresMarca {
  primaria: string;
  sucesso: string;
  perigo: string;
}

/** Identidade visual completa de uma marca (white label). */
export interface Marca {
  /** Nome exibido na navbar e no título da aba. */
  nome: string;
  /** Nome curto para telas pequenas (fallback: nome). */
  nomeCurto?: string;
  /** URL do logo (login e navbar). null = usa o ícone de fallback. */
  logoUrl: string | null;
  /** Ícone Material usado quando não há logo. */
  iconeFallback?: string;
  /** Favicon da aba. */
  faviconUrl?: string;
  /** Tagline exibida na tela de login. */
  tagline: string;
  /** Título da seção de marca no login (fallback: nome). */
  loginTitulo?: string;
  cores: CoresMarca;
}

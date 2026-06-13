export const theme = {
  colors: {
    background: '#0a0f1e',
    surface: '#111827',
    card: '#1a2332',
    border: '#1f2d3d',
    primary: '#0ea5e9',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    textPrimary: '#f1f5f9',
    textSecondary: '#64748b',
    textMuted: '#334155',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
} as const;

export type AppTheme = typeof theme;
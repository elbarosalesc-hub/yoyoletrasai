export const yoyoTokens = {
  color: {
    brand: '#7C3AED',
    brandStrong: '#6D28D9',
    brandSoft: '#F1EAFE',
    surface: '#FFFFFF',
    canvas: '#F7F7FB',
    text: '#171A26',
    muted: '#667085',
    border: '#E9E7F0',
    success: '#159A72',
    successSoft: '#E7F8F2',
    info: '#1479B8',
    infoSoft: '#EAF5FD',
    warning: '#C58A00',
    warningSoft: '#FFF6D8',
    danger: '#D92D20'
  },
  radius: { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  shadow: {
    card: '0 10px 30px rgba(45, 35, 75, 0.08)',
    elevated: '0 18px 50px rgba(45, 35, 75, 0.14)'
  },
  layout: { sidebar: 208, contentMax: 1180, mobileNav: 72, header: 72 },
  breakpoint: { mobile: 640, tablet: 900, desktop: 1200 }
} as const;

export type YoyoTokens = typeof yoyoTokens;

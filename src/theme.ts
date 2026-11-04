import type { ThemeConfig } from 'antd'

/** Couleurs de l'application mobile (lib/theme/app_theme.dart). */
export const BRAND = {
  green: '#2E7D32', // couleur de base du thème mobile
  greenSoft: '#E8F3E9',
  yellow: '#F9A825', // fond du logo
  yellowSoft: '#FFF4DA',
  background: '#F6F8F4',
  // Couleurs d'état, les mêmes que sur les téléphones.
  done: '#2E9E5B',
  todo: '#F59E0B',
  late: '#DC2626',
  info: '#2563EB',
}

export const THEME: ThemeConfig = {
  token: {
    colorPrimary: BRAND.green,
    colorSuccess: BRAND.done,
    colorWarning: BRAND.todo,
    colorError: BRAND.late,
    colorInfo: BRAND.info,
    colorLink: BRAND.green,
    colorBgLayout: BRAND.background,
    borderRadius: 10,
    borderRadiusLG: 18,
    fontFamily: "Roboto, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: { headerHeight: 64, siderBg: '#ffffff', headerBg: BRAND.background },
    Menu: {
      itemBorderRadius: 10,
      itemSelectedBg: BRAND.greenSoft,
      itemSelectedColor: BRAND.green,
    },
    Card: { headerFontSize: 15 },
    Table: { headerBg: '#FAFBF8' },
    Button: { fontWeight: 600 },
  },
}

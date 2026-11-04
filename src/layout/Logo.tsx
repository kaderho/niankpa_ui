/** Logo de l'application mobile (assets/branding/nian_kpa_logo.svg). */
export function Logo({ size = 32 }: { size?: number }) {
  return <img src="/logo.svg" width={size} height={size} alt="Nian Kpa" />
}

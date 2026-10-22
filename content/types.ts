export interface Work {
  slug: string
  nameZh: string
  nameEn: string
  version: string
  category: 'desktop' | 'mobile' | 'service'
  categoryLabel: string
  localFirst: boolean
  tagline: string
  summary: string
  features: string[]
  featureTags: string[]
  platforms: string[]
  stack: string[]
  accent: string
  accentSoft: string
  logo: string
  logoAlt: string
  shots: { src: string; alt: string; width: number; height: number }[]
  links: { repo: string; releases: string; demo: string | null }
  download: { status: 'available' | 'source' | 'soon'; label: string; url: string; note: string }
}

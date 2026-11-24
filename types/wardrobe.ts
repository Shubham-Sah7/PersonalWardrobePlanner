export type GarmentCategory =
  | 'All Items'
  | 'Tops'
  | 'Bottoms'
  | 'Dresses'
  | 'Jackets & Outerwear'
  | 'Shoes'
  | 'Accessories'

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All Season'

export type Occasion = 'Casual' | 'Smart Casual' | 'Work / Formal' | 'Evening' | 'Active'

export interface Garment {
  id: string
  name: string
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Jackets & Outerwear' | 'Shoes' | 'Accessories'
  color: {
    name: string
    hex: string
    family?: 'Neutral' | 'Monochrome' | 'Earth' | 'Blue' | 'Warm'
  }
  brand: string
  season: Season
  occasion: Occasion
  material: string
  pattern: string
  imageFront: string
  imageBack?: string
  favorite: boolean
  wearCount: number
  price: number
  lastWorn?: string
  dateAdded: string
  notes?: string
  hidden?: boolean
  aiConfidence?: {
    category: number
    brand: number
    material: number
    pattern: number
    color: number
  }
}

export interface Outfit {
  id: string
  title: string
  occasion: Occasion
  season: Season
  items: Garment[]
  wearCount: number
  lastWorn?: string
  createdAt: string
  notes?: string
}

export interface Collection {
  id: string
  title: string
  description: string
  type: 'Season' | 'Occasion' | 'Trip' | 'Capsule'
  clothingItemIds: string[]
  outfitIds: string[]
  coverImage: string
  season?: Season
}

export interface UploadBatchItem {
  id: string
  file?: File
  previewUrl: string
  name: string
  status: 'uploading' | 'analyzing' | 'complete' | 'flagged' | 'error'
  progress: number
  attributes?: Partial<Garment>
  detectedFlags?: string[]
}

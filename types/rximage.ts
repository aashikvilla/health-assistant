export interface RxImageEntry {
  imageUrl: string
  name: string
  ndc11: string
  rxcui: string
}

export interface RxImageApiResponse {
  nlmRxImages: RxImageEntry[]
  replyStatus: {
    success: boolean
    matchCount: number
  }
}

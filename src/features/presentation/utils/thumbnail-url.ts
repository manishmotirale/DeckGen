export function presentationThumbnailUrl(seed: string) {
  const safeSeed = encodeURIComponent(seed.trim())

  return `https://api.dicebear.com/9.x/glass/svg?seed=${safeSeed}&backgroundType=gradientLinear`
}

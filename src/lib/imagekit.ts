import ImageKit from '@imagekit/nodejs'

let imagekitClient: ImageKit | null = null

function getImageKitClient(): ImageKit | null {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  if (!privateKey) return null

  if (!imagekitClient) {
    imagekitClient = new ImageKit({
      privateKey,
    })
  }

  return imagekitClient
}

/**
 * Build a reliable, fast, watermark-free 16:9 background image URL for a slide.
 */
export function buildSlideImageUrl(prompt: string, seedKey?: string): string {
  const normalized = `${seedKey ?? ''}-${prompt}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)

  const seed = normalized || 'deckgen-slide'
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1280/720`
}

/**
 * Generate a transformed ImageKit URL if configured, otherwise fallback to a crisp 16:9 background.
 */
export async function generateImageWithImageKit(
  prompt: string,
  filename: string,
): Promise<string> {
  const client = getImageKitClient()
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT

  if (!client || !urlEndpoint) {
    return buildSlideImageUrl(prompt, filename)
  }

  try {
    return client.helper.buildSrc({
      urlEndpoint,
      src: `/presentations/${filename}.jpg`,
      transformation: [
        {
          height: 720,
          width: 1280,
          quality: 80,
        },
      ],
    })
  } catch (error) {
    console.error('ImageKit URL error:', error)
    return buildSlideImageUrl(prompt, filename)
  }
}

/**
 * Upload an image to ImageKit from a URL or base64 string.
 */
export async function uploadImageToImageKit(
  imageUrl: string,
  filename: string,
): Promise<string> {
  const client = getImageKitClient()
  if (!client) {
    return imageUrl
  }

  try {
    const result = await client.files.upload({
      file: imageUrl,
      fileName: filename.endsWith('.jpg') ? filename : `${filename}.jpg`,
      folder: '/presentations',
      useUniqueFileName: true,
    })

    return result.url ?? imageUrl
  } catch (error) {
    console.error('Failed to upload to ImageKit:', error)
    return imageUrl
  }
}

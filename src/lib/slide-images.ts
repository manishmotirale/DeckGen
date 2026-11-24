type ImageCandidate = {
  url: string
  title: string
  width: number
  height: number
  source: 'wikimedia' | 'wikipedia'
}

const EXCLUDED_FILENAME_PATTERN =
  /\b(logo|icon|flag|coat[_ ]of[_ ]arms|seal|emblem|map|locator|diagram|chart|graph|signature|grave|tomb|memorial|stamp|coin|banknote|medal|screenshot|document|page|scan|book|letter|newspaper|poster|cover|mugshot|portrait|headshot)\b/i

function cleanSearchTerms(raw: string): string {
  return raw
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\b(professional|cinematic|illustration|background|presentation|slide|modern|clean|minimal|aesthetic|high|quality|corporate|style|no|text|watermark|aspect|ratio|wide|composition|negative|space)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shortenQuery(query: string, maxWords: number): string {
  const words = cleanSearchTerms(query)
    .split(' ')
    .filter((w) => w.length > 2)
  return words.slice(0, maxWords).join(' ')
}

async function searchWikimediaCommons(
  query: string,
  limit = 8,
): Promise<ImageCandidate[]> {
  if (!query.trim()) return []

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    `${query} filetype:bitmap`,
  )}&gsrlimit=${Math.min(limit * 2, 16)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DeckGen/1.0 (https://deckgen.app)',
      },
    }).finally(() => clearTimeout(timer))

    if (!res.ok) return []

    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            index?: number
            title?: string
            imageinfo?: Array<{
              url?: string
              thumburl?: string
              width?: number
              height?: number
              mime?: string
            }>
          }
        >
      }
    }

    const pages = Object.values(data.query?.pages ?? {}).sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999),
    )

    const candidates: ImageCandidate[] = []

    for (const page of pages) {
      const info = page.imageinfo?.[0]
      if (!info) continue

      const mime = info.mime ?? ''
      if (!['image/jpeg', 'image/webp'].includes(mime)) continue

      const width = info.width ?? 0
      const height = info.height ?? 0
      if (width < 640 || height < 360) continue

      const ratio = width / height
      if (ratio < 1.15 || ratio > 2.4) continue

      const title = page.title ?? ''
      if (EXCLUDED_FILENAME_PATTERN.test(title)) continue

      const resolvedUrl = info.thumburl || info.url
      if (!resolvedUrl) continue

      candidates.push({
        url: resolvedUrl,
        title: title.replace(/^File:/i, '').replace(/\.[^.]+$/, ''),
        width,
        height,
        source: 'wikimedia',
      })

      if (candidates.length >= limit) break
    }

    return candidates
  } catch {
    return []
  }
}

async function searchWikipediaLeadImages(
  query: string,
  limit = 6,
): Promise<ImageCandidate[]> {
  if (!query.trim()) return []

  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query,
  )}&gsrlimit=${Math.min(limit * 2, 12)}&prop=pageimages&piprop=thumbnail&pithumbsize=1280&format=json`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DeckGen/1.0 (https://deckgen.app)',
      },
    }).finally(() => clearTimeout(timer))

    if (!res.ok) return []

    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            index?: number
            title?: string
            thumbnail?: {
              source?: string
              width?: number
              height?: number
            }
          }
        >
      }
    }

    const pages = Object.values(data.query?.pages ?? {}).sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999),
    )

    const candidates: ImageCandidate[] = []

    for (const page of pages) {
      const thumb = page.thumbnail
      if (!thumb?.source) continue
      if (thumb.source.includes('.svg')) continue

      const width = thumb.width ?? 0
      const height = thumb.height ?? 0
      if (width < 500 || height < 300) continue

      const ratio = width / height
      if (ratio < 1.1 || ratio > 2.4) continue

      if (EXCLUDED_FILENAME_PATTERN.test(thumb.source)) continue

      candidates.push({
        url: thumb.source,
        title: page.title ?? query,
        width,
        height,
        source: 'wikipedia',
      })

      if (candidates.length >= limit) break
    }

    return candidates
  } catch {
    return []
  }
}

/**
 * Search topic-matched high-resolution landscape photographs for a slide.
 */
export async function searchTopicImages(
  query: string,
  limit = 6,
): Promise<ImageCandidate[]> {
  const short3 = shortenQuery(query, 3)
  const short2 = shortenQuery(query, 2)
  const attempts = Array.from(
    new Set([short3, short2, query.trim()].filter((q) => q.length >= 2)),
  )

  const seen = new Set<string>()
  const collected: ImageCandidate[] = []

  for (const q of attempts) {
    const [commons, wiki] = await Promise.all([
      searchWikimediaCommons(q, limit),
      searchWikipediaLeadImages(q, Math.ceil(limit / 2)),
    ])

    for (const item of [...commons, ...wiki]) {
      if (seen.has(item.url)) continue
      seen.add(item.url)
      collected.push(item)
      if (collected.length >= limit) return collected
    }
  }

  return collected
}

/**
 * Resolve a single unique, topic-matched image URL for a slide.
 */
export async function findTopicSlideImage(
  slideImageQuery: string,
  slideTitle: string,
  deckTopic: string,
  usedUrls: Set<string>,
): Promise<string | null> {
  const queriesToTry = [
    shortenQuery(slideImageQuery, 3),
    shortenQuery(slideImageQuery, 2),
    shortenQuery(`${slideTitle} ${shortenQuery(deckTopic, 2)}`, 3),
    shortenQuery(slideTitle, 2),
    shortenQuery(deckTopic, 2),
  ].filter((q, idx, arr) => q.length >= 2 && arr.indexOf(q) === idx)

  for (const q of queriesToTry) {
    const candidates = await searchTopicImages(q, 8)
    const fresh = candidates.find((c) => !usedUrls.has(c.url))
    if (fresh) {
      usedUrls.add(fresh.url)
      return fresh.url
    }
  }

  return null
}

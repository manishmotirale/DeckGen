import pptxgen from 'pptxgenjs'

export type ExportableSlide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
}

export type PptxExportOptions = {
  title: string
  slides: ExportableSlide[]
  includeNotes?: boolean
  includeImages?: boolean
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) return null
    const blob = await res.blob()

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function parseBulletLines(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s+/, ''))
}

export async function exportToPptx({
  title,
  slides,
  includeNotes = true,
  includeImages = true,
}: PptxExportOptions) {
  const pptx = new pptxgen()

  pptx.author = 'DeckGen AI'
  pptx.title = title
  pptx.subject = 'AI Generated Presentation by DeckGen'
  pptx.layout = 'LAYOUT_16x9'

  const dataUrls = includeImages
    ? await Promise.all(
        slides.map((s) =>
          s.imageUrl ? fetchImageAsDataUrl(s.imageUrl) : Promise.resolve(null),
        ),
      )
    : slides.map(() => null)

  slides.forEach((slideData, idx) => {
    const slide = pptx.addSlide()
    const isHero = idx === 0
    const imgData = dataUrls[idx]
    const imageOnLeft = !isHero && idx % 2 === 0

    // Crisp editorial dark canvas
    slide.background = { color: '111318' }

    // Top slide counter
    slide.addText(
      `${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`,
      {
        x: 0.6,
        y: 0.35,
        w: 1.4,
        h: 0.28,
        fontSize: 10,
        fontFace: 'Arial',
        color: 'E8A06E',
        bold: true,
      },
    )

    if (!isHero) {
      slide.addText(title, {
        x: 4.5,
        y: 0.35,
        w: 4.9,
        h: 0.28,
        fontSize: 9,
        fontFace: 'Arial',
        color: '7A8294',
        align: 'right',
      })
    }

    if (imgData) {
      // Aligned 2-column split: text and image NEVER collide
      const textX = imageOnLeft ? 4.85 : 0.6
      const imgX = imageOnLeft ? 0.6 : 5.65
      const textW = 4.65
      const imgW = 3.85

      // Accent bar above title
      slide.addShape('rect' as pptxgen.ShapeType, {
        x: textX,
        y: isHero ? 1.45 : 0.95,
        w: 0.85,
        h: 0.06,
        fill: { color: 'E8A06E' },
      })

      // Headline
      slide.addText(slideData.title, {
        x: textX,
        y: isHero ? 1.65 : 1.15,
        w: textW,
        h: isHero ? 1.35 : 0.95,
        fontSize: isHero ? 30 : 24,
        fontFace: 'Arial',
        color: 'FFFFFF',
        bold: true,
        valign: 'top',
      })

      // Body / Bullets
      const lines = parseBulletLines(slideData.content)
      if (lines.length > 0) {
        if (isHero || lines.length === 1) {
          slide.addText(lines.join(' '), {
            x: textX,
            y: isHero ? 3.15 : 2.25,
            w: textW,
            h: 1.8,
            fontSize: isHero ? 15 : 14,
            fontFace: 'Arial',
            color: 'D1D5DB',
            valign: 'top',
          })
        } else {
          const formatted = lines.slice(0, 5).map((line) => ({
            text: line,
            options: {
              fontSize: 13.5,
              color: 'E5E7EB',
              bullet: { code: '2022', color: 'E8A06E' },
              breakLine: true,
              paraSpaceAfter: 9,
            },
          }))

          slide.addText(formatted, {
            x: textX,
            y: 2.2,
            w: textW,
            h: 2.85,
            fontFace: 'Arial',
            valign: 'top',
          })
        }
      }

      // Framed clear topic image
      try {
        slide.addShape('roundRect' as pptxgen.ShapeType, {
          x: imgX - 0.04,
          y: 1.16,
          w: imgW + 0.08,
          h: 3.38,
          fill: { color: '1E222D' },
          line: { color: '2E3445', width: 1 },
        })

        slide.addImage({
          data: imgData,
          x: imgX,
          y: 1.2,
          w: imgW,
          h: 3.3,
          sizing: { type: 'cover', w: imgW, h: 3.3 },
        })
      } catch {
        // Skip image if unsupported format
      }
    } else {
      // Clean centered / single-column layout without image
      slide.addShape('rect' as pptxgen.ShapeType, {
        x: isHero ? 4.4 : 0.65,
        y: isHero ? 1.55 : 0.95,
        w: 1.2,
        h: 0.06,
        fill: { color: 'E8A06E' },
      })

      slide.addText(slideData.title, {
        x: 0.65,
        y: isHero ? 1.8 : 1.15,
        w: 8.7,
        h: 1.15,
        fontSize: isHero ? 36 : 28,
        fontFace: 'Arial',
        color: 'FFFFFF',
        bold: true,
        align: isHero ? 'center' : 'left',
        valign: 'middle',
      })

      const lines = parseBulletLines(slideData.content)
      if (lines.length > 0) {
        if (isHero || lines.length === 1) {
          slide.addText(lines.join(' '), {
            x: 1.0,
            y: isHero ? 3.2 : 2.4,
            w: 8.0,
            h: 1.6,
            fontSize: 17,
            fontFace: 'Arial',
            color: 'D1D5DB',
            align: isHero ? 'center' : 'left',
            valign: 'top',
          })
        } else {
          const formatted = lines.slice(0, 6).map((line) => ({
            text: line,
            options: {
              fontSize: 16,
              color: 'E5E7EB',
              bullet: { code: '2022', color: 'E8A06E' },
              breakLine: true,
              paraSpaceAfter: 10,
            },
          }))

          slide.addText(formatted, {
            x: 0.7,
            y: 2.3,
            w: 8.6,
            h: 2.8,
            fontFace: 'Arial',
            valign: 'top',
          })
        }
      }
    }

    // Subtle footer
    slide.addText('DeckGen Studio', {
      x: 0.6,
      y: 5.2,
      w: 3.0,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: '6B7280',
    })

    if (includeNotes && slideData.notes) {
      slide.addNotes(slideData.notes)
    }
  })

  const safeName = title.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/^_|_$/g, '')
  const filename = `${safeName || 'DeckGen_Presentation'}.pptx`
  await pptx.writeFile({ fileName: filename })

  return filename
}

export function exportToPrintablePdf({
  title,
  slides,
  includeNotes = false,
  includeImages = true,
}: PptxExportOptions) {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const slidesHtml = slides
    .map((s, idx) => {
      const lines = parseBulletLines(s.content)
      const isHero = idx === 0
      const hasImg = includeImages && Boolean(s.imageUrl)
      const imgLeft = !isHero && idx % 2 === 0

      const body =
        isHero || lines.length <= 1
          ? `<p class="subtitle">${lines.map(escapeHtml).join(' ')}</p>`
          : `<ul class="bullets">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`

      const imgBlock = hasImg
        ? `<div class="media"><img src="${escapeHtml(s.imageUrl!)}" alt="" /></div>`
        : ''

      const notes =
        includeNotes && s.notes
          ? `<div class="notes"><strong>Speaker Notes:</strong> ${escapeHtml(s.notes)}</div>`
          : ''

      return `
        <section class="slide">
          <div class="top">
            <span class="pill">${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
            <span class="deck-name">${escapeHtml(title)}</span>
          </div>
          <div class="grid ${hasImg ? 'split' : 'single'} ${imgLeft ? 'reverse' : ''}">
            <div class="text-col">
              <div class="accent"></div>
              <h1>${escapeHtml(s.title)}</h1>
              ${body}
            </div>
            ${imgBlock}
          </div>
          ${notes}
        </section>
      `
    })
    .join('')

  const printWin = window.open('', '_blank', 'width=1200,height=750')
  if (!printWin) {
    throw new Error('Popup blocked. Please allow popups to export as PDF.')
  }

  printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #111318; color: #fff; font-family: Inter, system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .slide { width: 100vw; height: 100vh; page-break-after: always; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 56px; background: linear-gradient(135deg, #11141c 0%, #171b26 100%); }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .pill { font-size: 11px; font-weight: 600; color: #e8a06e; border: 1px solid rgba(232,160,110,0.35); background: rgba(232,160,110,0.1); padding: 4px 12px; border-radius: 99px; }
    .deck-name { font-size: 11px; color: rgba(255,255,255,0.45); }
    .grid { flex: 1; display: grid; align-items: center; gap: 40px; }
    .grid.split { grid-template-columns: 1.2fr 1fr; }
    .grid.split.reverse .text-col { order: 2; }
    .grid.split.reverse .media { order: 1; }
    .grid.single { max-width: 820px; margin: 0 auto; }
    .accent { width: 52px; height: 4px; background: #e8a06e; border-radius: 99px; margin-bottom: 18px; }
    h1 { margin: 0 0 18px; font-size: 36px; line-height: 1.15; font-weight: 700; }
    .subtitle { font-size: 18px; line-height: 1.6; color: rgba(255,255,255,0.82); margin: 0; }
    .bullets { margin: 0; padding-left: 20px; font-size: 17px; line-height: 1.6; color: rgba(255,255,255,0.9); }
    .bullets li { margin-bottom: 10px; }
    .bullets li::marker { color: #e8a06e; }
    .media { width: 100%; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 20px 45px rgba(0,0,0,0.45); }
    .media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .notes { padding: 12px 16px; border-radius: 10px; background: rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.75); }
  </style>
</head>
<body>
  ${slidesHtml}
  <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
</body>
</html>`)
  printWin.document.close()
}

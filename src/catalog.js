
const DEMO_ID_PREFIX = 'DEMO-'

function parseCsv(csv) {
  const text = csv.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && insideQuotes && next === '"') {
      field += '"'
      i++
    } else if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === ',' && !insideQuotes) {
      row.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++

      row.push(field.trim())

      if (row.some(value => value !== '')) {
        rows.push(row)
      }

      row = []
      field = ''
    } else {
      field += char
    }
  }

  row.push(field.trim())

  if (row.some(value => value !== '')) {
    rows.push(row)
  }

  if (rows.length < 2) return []

  const headers = rows[0].map(header =>
    header.trim().toLowerCase()
  )

  return rows.slice(1).map(values => {
    const product = {}

    headers.forEach((header, index) => {
      product[header] = values[index] ?? ''
    })

    return product
  })
}

function parseNumber(value) {
  let normalized = String(value ?? '')
    .trim()
    .replace(/[^\d.,-]/g, '')

  if (normalized.includes(',') && normalized.includes('.')) {
    if (normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else {
      normalized = normalized.replace(/,/g, '')
    }
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.')
  }

  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

function parseList(value) {
  return String(value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function isTrue(value) {
  return ['si', 'sí', 'yes', 'true', '1']
    .includes(String(value ?? '').trim().toLowerCase())
}

function normalizeProduct(product) {
  return {
    id: product.id?.trim() ?? '',
    name: product.name?.trim() ?? '',
    category: product.category?.trim() ?? '',
    price: parseNumber(product.price),
    sizes: parseList(product.sizes),
    colors: parseList(product.colors),
    stock: parseNumber(product.stock),
    image: product.image?.trim() ?? '',
    description: product.description?.trim() ?? '',
    visible: isTrue(product.visible),
    isNew: isTrue(product.new),
    isOffer: isTrue(product.offer),
  }
}

export function parseCatalog(csv) {
  return parseCsv(csv)
    .map(normalizeProduct)
    .filter(product => {
      const isDemo = product.id
        .toUpperCase()
        .startsWith(DEMO_ID_PREFIX)

      return (
        !isDemo &&
        product.id &&
        product.name &&
        product.visible &&
        product.price > 0 &&
        product.stock > 0
      )
    })
}

export async function loadCatalog(csvUrl) {
  if (!csvUrl) {
    throw new Error('Falta configurar la dirección CSV del catálogo.')
  }

  const response = await fetch(csvUrl)

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar el catálogo (${response.status}).`
    )
  }

  const csv = await response.text()
  return parseCatalog(csv)
}


import { useEffect, useState } from 'react'
import { loadCatalog } from './catalog.js'

const WHATSAPP_NUMBER = '5358420732'

function formatPrice(price, currency) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(price)
}

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [selections, setSelections] = useState({})
  const [cart, setCart] = useState([])
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    const catalogUrl = import.meta.env.VITE_CATALOG_CSV_URL

    if (!catalogUrl) return

    let active = true

    async function getProducts() {
      setLoading(true)
      setCatalogError('')

      try {
        const catalog = await loadCatalog(catalogUrl)
        if (active) setProducts(catalog)
      } catch (error) {
        if (active) setCatalogError(error.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    getProducts()

    return () => {
      active = false
    }
  }, [])

  function updateSelection(productId, field, value) {
    setSelections(previous => ({
      ...previous,
      [productId]: {
        ...previous[productId],
        [field]: value,
      },
    }))
  }

  function addToCart(product, selection) {
    if (product.sizes.length > 0 && !selection.size) {
      setCartMessage(`Selecciona la talla de ${product.name}.`)
      return
    }

    if (product.colors.length > 0 && !selection.color) {
      setCartMessage(`Selecciona el color de ${product.name}.`)
      return
    }

    const existingKey = `${product.id}|${selection.size || ''}|${selection.color || ''}`

    setCart(previous => {
      const existing = previous.find(item => item.key === existingKey)

      if (existing) {
        return previous.map(item =>
          item.key === existingKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...previous,
        {
          key: existingKey,
          product,
          size: selection.size || '',
          color: selection.color || '',
          quantity: 1,
        },
      ]
    })

    setCartMessage(`${product.name} se añadió al carrito.`)
  }

  function changeQuantity(key, amount) {
    setCart(previous =>
      previous
        .map(item =>
          item.key === key
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  function removeFromCart(key) {
    setCart(previous => previous.filter(item => item.key !== key))
  }

  function createCartWhatsAppLink() {
    const totals = {}

    cart.forEach(item => {
      const currency = item.product.currency
      totals[currency] =
        (totals[currency] || 0) +
        item.product.price * item.quantity
    })

    const message = [
      '¡Hola, Tienda HEY! Quiero realizar este pedido:',
      '',
      ...cart.flatMap((item, index) => [
        `${index + 1}. ${item.product.name}`,
        `Cantidad: ${item.quantity}`,
        `Precio unitario: ${formatPrice(item.product.price, item.product.currency)}`,
        `Talla: ${item.size || 'No especificada'}`,
        `Color: ${item.color || 'No especificado'}`,
        `Subtotal: ${formatPrice(item.product.price * item.quantity, item.product.currency)}`,
        '',
      ]),
      'RESUMEN:',
      ...Object.entries(totals).map(([currency, total]) =>
        `Total en ${currency}: ${formatPrice(total, currency)}`
      ),
      '',
      '¿Podrían confirmarme la disponibilidad de estos productos?',
    ].join('\n')

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const cartTotals = cart.reduce((totals, item) => {
    const currency = item.product.currency
    totals[currency] =
      (totals[currency] || 0) +
      item.product.price * item.quantity
    return totals
  }, {})

  return (
    <main className="site">
      <header className="header">
        <span className="brand-name">Tienda de moda femenina</span>

        <nav className="navigation" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#coleccion">Colección</a>
          <a href="#nosotros">Nosotros</a>
        </nav>

        <a className="header-cta" href="#carrito">
          Carrito ({cartCount})
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-content">
          <span className="eyebrow">TIENDA HEY! · MODA FEMENINA</span>

          <h1>
            Tu estilo.
            <br />
            Tu momento.
            <br />
            <span>Tu mejor versión.</span>
          </h1>

          <p>
            Descubre prendas y accesorios para crear looks
            que hablan de ti.
          </p>

          <a className="primary-button" href="#coleccion">
            Descubrir colección →
          </a>
        </div>

        <div className="hero-visual">
          <span className="visual-label">
            ESPACIO PARA LA FOTOGRAFÍA DE CAMPAÑA
          </span>
        </div>
      </section>

      <section className="collection" id="coleccion">
        <div>
          <span className="eyebrow">ENCUENTRA TU ESTILO</span>
          <h2>La colección</h2>
          <p>
            Explora nuestras novedades y encuentra tus próximos favoritos.
          </p>
        </div>

        {loading && <p>Cargando colección...</p>}

        {catalogError && (
          <p role="alert">{catalogError}</p>
        )}

        {!loading && !catalogError && products.length === 0 && (
          <p className="catalog-note">
            Catálogo de productos en preparación.
          </p>
        )}

        {products.length > 0 && (
          <div className="product-list">
            {products.map(product => {
              const selection = selections[product.id] || {}

              return (
                <article key={product.id} className="product">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  )}

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <p>
                    {formatPrice(product.price, product.currency)}
                  </p>

                  {product.sizes.length > 0 && (
                    <div className="product-option">
                      <label htmlFor={`size-${product.id}`}>
                        Talla
                      </label>

                      <select
                        id={`size-${product.id}`}
                        value={selection.size || ''}
                        onChange={event =>
                          updateSelection(
                            product.id,
                            'size',
                            event.target.value
                          )
                        }
                      >
                        <option value="">Selecciona una talla</option>

                        {product.sizes.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {product.colors.length > 0 && (
                    <div className="product-option">
                      <label htmlFor={`color-${product.id}`}>
                        Color
                      </label>

                      <select
                        id={`color-${product.id}`}
                        value={selection.color || ''}
                        onChange={event =>
                          updateSelection(
                            product.id,
                            'color',
                            event.target.value
                          )
                        }
                      >
                        <option value="">Selecciona un color</option>

                        {product.colors.map(color => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <p className="selection-summary">
                    {selection.size
                      ? `Talla: ${selection.size}`
                      : 'Talla sin seleccionar'}
                    {' · '}
                    {selection.color
                      ? `Color: ${selection.color}`
                      : 'Color sin seleccionar'}
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => addToCart(product, selection)}
                  >
                    Añadir al carrito
                  </button>
                </article>
              )
            })}
          </div>
        )}

        {cartMessage && (
          <p role="status">{cartMessage}</p>
        )}
      </section>

      <section className="collection" id="carrito">
        <span className="eyebrow">TU SELECCIÓN</span>
        <h2>Mi carrito ({cartCount})</h2>

        {cart.length === 0 ? (
          <p className="catalog-note">
            Todavía no has añadido productos.
          </p>
        ) : (
          <>
            <div className="product-list">
              {cart.map(item => (
                <article className="product" key={item.key}>
                  <h3>{item.product.name}</h3>

                  <p>
                    {formatPrice(
                      item.product.price,
                      item.product.currency
                    )}
                  </p>

                  <p>
                    Talla: {item.size || 'No especificada'}
                    {' · '}
                    Color: {item.color || 'No especificado'}
                  </p>

                  <p>
                    Cantidad: {item.quantity}
                  </p>

                  <p>
                    Subtotal:{' '}
                    {formatPrice(
                      item.product.price * item.quantity,
                      item.product.currency
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() => changeQuantity(item.key, -1)}
                  >
                    −
                  </button>

                  <button
                    type="button"
                    onClick={() => changeQuantity(item.key, 1)}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>

            <h3>Resumen del pedido</h3>

            {Object.entries(cartTotals).map(([currency, total]) => (
              <p key={currency}>
                Total en {currency}: {formatPrice(total, currency)}
              </p>
            ))}

            <a
              className="primary-button"
              href={createCartWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enviar pedido por WhatsApp
            </a>
          </>
        )}
      </section>

      <section className="about" id="nosotros">
        <h2>Moda que te inspira.</h2>
        <p>Viste tu mejor versión.</p>
      </section>

      <footer className="footer">
        <span>Tienda HEY!</span>
        <span>Moda femenina</span>
      </footer>
    </main>
  )
}

export default App

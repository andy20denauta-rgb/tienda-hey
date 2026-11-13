
import { useEffect, useState } from 'react'
import { loadCatalog } from './catalog.js'

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

  useEffect(() => {
    const catalogUrl = import.meta.env.VITE_CATALOG_CSV_URL

    if (!catalogUrl) return

    let active = true

    async function getProducts() {
      setLoading(true)
      setCatalogError('')

      try {
        const catalog = await loadCatalog(catalogUrl)

        if (active) {
          setProducts(catalog)
        }
      } catch (error) {
        if (active) {
          setCatalogError(error.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
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

  return (
    <main className="site">
      <header className="header">
        <span className="brand-name">Tienda de moda femenina</span>

        <nav className="navigation" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#coleccion">Colección</a>
          <a href="#nosotros">Nosotros</a>
        </nav>

        <a className="header-cta" href="#coleccion">
          Ver colección
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
                </article>
              )
            })}
          </div>
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


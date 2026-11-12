
function App() {
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

        <p className="catalog-note">
          Catálogo de productos en preparación.
        </p>
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


export function Footer() {
  const abrirWhatsApp = () => {
    const numeroWhatsApp = "5493364188464";
    const mensaje = "Hola! Me gustaría hacer un pedido.";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <footer>
      <div className="footer-content">
        {/* Sección de información */}
        <div className="footer-section">
          <div className="footer-logo">
            <img src="/QCH_logo_transparente.png" alt="Que Comemos Hoy" />
            <h3>Que Comemos Hoy</h3>
          </div>
          <p className="footer-description">
            Comida casera preparada con amor y los mejores ingredientes. Hacemos
            que cada comida sea especial.
          </p>
        </div>

        {/* Sección de contacto */}
        <div className="footer-section">
          <h4 className="footer-title">Contacto</h4>
          <div className="footer-links">
            <a href="tel:+5493364188464" className="footer-link">
              <span className="footer-icon">📞</span>
              +54 9 3364 188464
            </a>
            <a href="mailto:qch.sn2025@gmail.com" className="footer-link">
              <span className="footer-icon">✉️</span>
              qch.sn2025@gmail.com
            </a>
            <div className="footer-link">
              <span className="footer-icon">📍</span>
              Ameghino 62, San Nicolás
            </div>
          </div>
        </div>

        {/* Sección de redes sociales */}
        <div className="footer-section">
          <h4 className="footer-title">Síguenos</h4>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/quecomemoshoysn/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn instagram"
            >
              <span className="social-icon">📷</span>
              Instagram
            </a>
            <button onClick={abrirWhatsApp} className="social-btn whatsapp">
              <span className="social-icon">💬</span>
              WhatsApp
            </button>
          </div>
        </div>

        {/* Sección de horarios */}
        <div className="footer-section">
          <h4 className="footer-title">Horarios</h4>
          <div className="footer-hours">
            <div className="hour-item">
              <span className="day">Lunes - Domingo</span>
              <span className="time">11:00 - 22:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; 2025 ¿Que Comemos Hoy?. Todos los derechos reservados.
        </p>
        <p className="footer-dev">
          Desarrollado por{" "}
          <span className="dev-highlight">Sabores Digitales</span>
        </p>
      </div>
    </footer>
  );
}

import { useEffect } from 'react';

// Ventana modal reutilizable para los formularios
export default function Modal({ titulo, alCerrar, children }) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && alCerrar();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [alCerrar]);

  return (
    <div className="modal__fondo" onMouseDown={alCerrar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="modal__titulo">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

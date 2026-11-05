import { useEffect } from 'react';

// Mensaje flotante de éxito o error (se cierra solo a los 3.5 s)
export default function Aviso({ texto, tipo, alCerrar }) {
  useEffect(() => {
    const t = setTimeout(alCerrar, 3500);
    return () => clearTimeout(t);
  }, [alCerrar]);

  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {texto}
    </div>
  );
}

import { useState } from 'react';
import Productos from './pages/Productos.jsx';
import Categorias from './pages/Categorias.jsx';
import Aviso from './components/Aviso.jsx';

export default function App() {
  const [pestana, setPestana] = useState('productos');
  const [aviso, setAviso] = useState(null); // { texto, tipo: 'ok' | 'error' }

  // Muestra un mensaje que desaparece solo
  const avisar = (texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() });
  };

  return (
    <>
      <header className="barra">
        <div className="barra__contenido">
          <h1 className="marca">Ferretería</h1>
          <nav className="pestanas" aria-label="Secciones">
            <button
              className={pestana === 'productos' ? 'activa' : ''}
              onClick={() => setPestana('productos')}
            >
              Productos
            </button>
            <button
              className={pestana === 'categorias' ? 'activa' : ''}
              onClick={() => setPestana('categorias')}
            >
              Categorías
            </button>
          </nav>
        </div>
      </header>

      <main className="contenido">
        {pestana === 'productos' ? <Productos avisar={avisar} /> : <Categorias avisar={avisar} />}
      </main>

      {aviso && <Aviso key={aviso.id} {...aviso} alCerrar={() => setAviso(null)} />}
    </>
  );
}

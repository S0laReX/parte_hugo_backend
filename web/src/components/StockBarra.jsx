// Barra visual de stock: rojo si queda poco, amarillo si es medio, verde si hay suficiente
export const STOCK_BAJO = 10;

export default function StockBarra({ stock }) {
  const nivel = stock === 0 ? 'agotado' : stock < STOCK_BAJO ? 'bajo' : stock < 30 ? 'medio' : 'alto';
  const ancho = Math.min(100, (stock / 60) * 100);
  const texto = stock === 0 ? 'Agotado' : `${stock} u.`;

  return (
    <div className={`stock stock--${nivel}`}>
      <span className="stock__numero">{texto}</span>
      <span className="stock__pista" aria-hidden="true">
        <span className="stock__relleno" style={{ width: `${ancho}%` }} />
      </span>
    </div>
  );
}

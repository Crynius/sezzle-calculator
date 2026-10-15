import { useState, useEffect } from 'react';
import './App.css';
import { calculateExpression } from './services/api';

interface HistoryItem {
  id: string;
  expression: string;
  result: number;
}

const MAX_HISTORY = 8;

export function App() {
  const [expression, setExpression] = useState<string>('0');
  const [prevCalculation, setPrevCalculation] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Agregar carácter a la expresión
  const appendToken = (token: string) => {
    setErrorMessage(null);
    if (expression === '0' && token !== '.') {
      setExpression(token);
    } else {
      setExpression(prev => prev + token);
    }
  };

  // Limpiar todo (C)
  const clearAll = () => {
    setExpression('0');
    setPrevCalculation('');
    setErrorMessage(null);
  };

  // Borrar último carácter (⌫)
  const deleteLast = () => {
    setErrorMessage(null);
    if (expression.length <= 1) {
      setExpression('0');
    } else {
      setExpression(prev => prev.slice(0, -1));
    }
  };

  // Evaluar expresión al presionar "="
  const handleEquals = async () => {
    if (!expression || expression === '0') return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resp = await calculateExpression(expression);
      setPrevCalculation(`${expression} =`);
      setExpression(String(resp.result));

      // Guardar en historial con tope de 8
      setHistory(prev => [
        { id: Math.random().toString(), expression, result: resp.result },
        ...prev
      ].slice(0, MAX_HISTORY));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Expresión inválida');
    } finally {
      setIsLoading(false);
    }
  };

  // Reusar un valor del historial
  const restoreFromHistory = (val: number) => {
    setExpression(String(val));
    setShowHistory(false);
  };

  // Soporte de teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') appendToken(e.key);
      if (e.key === '.') appendToken('.');
      if (e.key === '+') appendToken(' + ');
      if (e.key === '-') appendToken(' − ');
      if (e.key === '*') appendToken(' × ');
      if (e.key === '%') appendToken('%');
      if (e.key === '/') {
        e.preventDefault();
        appendToken(' ÷ ');
      }
      if (e.key === '(' || e.key === ')') appendToken(e.key);
      if (e.key === '^') appendToken(' ^ ');
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      }
      if (e.key === 'Backspace') deleteLast();
      if (e.key === 'Escape') {
        if (showHistory) setShowHistory(false);
        else clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="app-wrapper">
      <div className="calculator-card">
        {/* Encabezado */}
        <div className="calc-header">
          <div className="brand-wrapper">
            <div className="brand-logo">S</div>
            <span className="brand-name">Sezzle</span>
          </div>
          <button
            className={`history-toggle-btn ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="Ver historial a la derecha"
          >
            <span>Historial</span>
            {history.length > 0 && (
              <span className="history-badge">{history.length}</span>
            )}
          </button>
        </div>

        {/* Notificación de error */}
        {errorMessage && (
          <div className="error-toast">
            <span>⚠️ {errorMessage}</span>
            <button className="error-close-btn" onClick={() => setErrorMessage(null)}>✕</button>
          </div>
        )}

        {/* Pantalla con expresión completa */}
        <div className="calc-display">
          <div className="display-expression">{prevCalculation}</div>
          <div className="display-value" data-testid="display-value">
            {isLoading ? '...' : expression}
          </div>
        </div>

        {/* Teclado de 4 columnas con paréntesis y operadores completos */}
        <div className="keypad">
          {/* Fila 1: Control y paréntesis */}
          <button className="calc-btn btn-clear" onClick={clearAll}>C</button>
          <button className="calc-btn btn-fn" onClick={() => appendToken('(')}>(</button>
          <button className="calc-btn btn-fn" onClick={() => appendToken(')')}>)</button>
          <button className="calc-btn btn-op" onClick={() => appendToken(' ÷ ')}>÷</button>

          {/* Fila 2: Funciones avanzadas y multiplicación */}
          <button className="calc-btn btn-fn" onClick={() => appendToken('sqrt(')}>√</button>
          <button className="calc-btn btn-fn" onClick={() => appendToken(' ^ ')}>xʸ</button>
          <button className="calc-btn btn-fn" onClick={() => appendToken('%')}>%</button>
          <button className="calc-btn btn-op" onClick={() => appendToken(' × ')}>×</button>

          {/* Fila 3 */}
          <button className="calc-btn btn-num" onClick={() => appendToken('7')}>7</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('8')}>8</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('9')}>9</button>
          <button className="calc-btn btn-op" onClick={() => appendToken(' − ')}>−</button>

          {/* Fila 4 */}
          <button className="calc-btn btn-num" onClick={() => appendToken('4')}>4</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('5')}>5</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('6')}>6</button>
          <button className="calc-btn btn-op" onClick={() => appendToken(' + ')}>+</button>

          {/* Fila 5 */}
          <button className="calc-btn btn-num" onClick={() => appendToken('1')}>1</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('2')}>2</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('3')}>3</button>
          <button className="calc-btn btn-fn" onClick={deleteLast}>⌫</button>

          {/* Fila 6: 0, punto decimal e igual */}
          <button className="calc-btn btn-num" onClick={() => appendToken('0')}>0</button>
          <button className="calc-btn btn-num" onClick={() => appendToken('.')}>.</button>
          <button className="calc-btn btn-equals" onClick={handleEquals}>=</button>
        </div>
      </div>

      {/* Panel lateral de historial a la derecha */}
      {showHistory && (
        <div className="history-side-panel">
          <div className="history-header">
            <div className="history-title-group">
              <h3 className="history-title">Historial</h3>
              <span className="history-count">({history.length}/{MAX_HISTORY})</span>
            </div>
            <div className="history-actions">
              {history.length > 0 && (
                <button className="clear-btn" onClick={() => setHistory([])}>
                  Vaciar
                </button>
              )}
              <button className="close-btn" onClick={() => setShowHistory(false)}>
                ✕
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              No hay operaciones registradas aún.<br />
              (Máximo {MAX_HISTORY} cálculos)
            </div>
          ) : (
            <ul className="history-list">
              {history.map(item => (
                <li
                  key={item.id}
                  className="history-item"
                  title="Haz clic para reusar este resultado"
                  onClick={() => restoreFromHistory(item.result)}
                >
                  <div className="history-expr">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
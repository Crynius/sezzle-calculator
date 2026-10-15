export interface CalculationResponse {
  result: number;
  expression: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function calculateExpression(expression: string): Promise<CalculationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expression }),
  });

  // Si la respuesta no es un JSON válido o viene vacía, evita que el navegador lance 'Unexpected end of JSON'
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Error del servidor (${response.status})`);
  }

  if (!data) {
    throw new Error('Respuesta inválida del servidor');
  }

  return data as CalculationResponse;
}
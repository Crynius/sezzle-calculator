package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestEvaluate(t *testing.T) {
	tests := []struct {
		name        string
		expression  string
		expected    float64
		expectedErr error
	}{
		{"Precedencia combinada", "3 * 3 - 6 / 8", 8.25, nil},
		{"Con paréntesis", "(3 + 2) * 4", 20, nil},
		{"Paréntesis anidados", "((5 + 5) * 2) - 10", 10, nil},
		{"Potencias y suma", "2^3 + 4", 12, nil},
		{"Raíz cuadrada", "sqrt(16) + 6", 10, nil},
		{"Símbolos visuales", "10 × 5 − 8 ÷ 2", 46, nil},
		{"Número negativo", "-5 + 15", 10, nil},
		{"División por cero", "10 / 0", 0, ErrDivisionByZero},
		{"Raíz negativa error", "sqrt(-9)", 0, ErrNegativeSquareRoot},
		{"Paréntesis desbalanceados", "(5 + 3", 0, ErrMismatchedParens},
		{"Expresión inválida", "5 ++ * 3", 0, ErrInvalidExpression},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Evaluate(tt.expression)

			if tt.expectedErr != nil {
				if !errors.Is(err, tt.expectedErr) {
					t.Errorf("expected error %v, got %v", tt.expectedErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if math.Abs(result-tt.expected) > 1e-9 {
				t.Errorf("expected %f, got %f", tt.expected, result)
			}
		})
	}
}

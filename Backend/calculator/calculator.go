package calculator

import (
	"errors"
	"math"
	"strconv"
	"strings"
	"unicode"
)

var (
	ErrDivisionByZero     = errors.New("division by zero is not allowed")
	ErrNegativeSquareRoot = errors.New("square root of negative number is not defined for real numbers")
	ErrInvalidExpression  = errors.New("invalid mathematical expression")
	ErrMismatchedParens   = errors.New("mismatched or unclosed parentheses")
	ErrArithmeticOverflow = errors.New("arithmetic overflow: result is too large")
	ErrUndefinedResult    = errors.New("undefined mathematical result for real numbers")
)

type parser struct {
	input []rune
	pos   int
}

// Evaluate analiza y calcula una expresión matemática completa
func Evaluate(expr string) (float64, error) {
	expr = strings.ReplaceAll(expr, "×", "*")
	expr = strings.ReplaceAll(expr, "÷", "/")
	expr = strings.ReplaceAll(expr, "−", "-")
	expr = strings.ReplaceAll(expr, "√", "sqrt")

	p := &parser{input: []rune(expr), pos: 0}
	val, err := p.parseExpression()
	if err != nil {
		return 0, err
	}
	p.skipWhitespace()
	if p.pos < len(p.input) {
		return 0, ErrInvalidExpression
	}

	// Protección contra desbordamiento numérico (Infinito) e indefiniciones (NaN)
	if math.IsInf(val, 0) {
		return 0, ErrArithmeticOverflow
	}
	if math.IsNaN(val) {
		return 0, ErrUndefinedResult
	}

	return val, nil
}

func (p *parser) skipWhitespace() {
	for p.pos < len(p.input) && unicode.IsSpace(p.input[p.pos]) {
		p.pos++
	}
}

// Expression = Term { ("+" | "-") Term }
func (p *parser) parseExpression() (float64, error) {
	val, err := p.parseTerm()
	if err != nil {
		return 0, err
	}

	for {
		p.skipWhitespace()
		if p.pos >= len(p.input) {
			break
		}
		ch := p.input[p.pos]
		if ch == '+' {
			p.pos++
			rhs, err := p.parseTerm()
			if err != nil {
				return 0, err
			}
			val += rhs
		} else if ch == '-' {
			p.pos++
			rhs, err := p.parseTerm()
			if err != nil {
				return 0, err
			}
			val -= rhs
		} else {
			break
		}
	}
	return val, nil
}

// Term = Factor { ("*" | "/" | MULTIPLICACION_IMPLICITA) Factor }
func (p *parser) parseTerm() (float64, error) {
	val, err := p.parseFactor()
	if err != nil {
		return 0, err
	}

	for {
		p.skipWhitespace()
		if p.pos >= len(p.input) {
			break
		}
		ch := p.input[p.pos]
		if ch == '*' {
			p.pos++
			rhs, err := p.parseFactor()
			if err != nil {
				return 0, err
			}
			val *= rhs
		} else if ch == '/' {
			p.pos++
			rhs, err := p.parseFactor()
			if err != nil {
				return 0, err
			}
			if rhs == 0 {
				return 0, ErrDivisionByZero
			}
			val /= rhs
		} else if ch == '(' || unicode.IsDigit(ch) || (p.pos+4 <= len(p.input) && strings.ToLower(string(p.input[p.pos:p.pos+4])) == "sqrt") {
			// Multiplicación implícita: soporta (2 + 3)2, 2(3 + 4), (2)(3) y 2sqrt(16)
			rhs, err := p.parseFactor()
			if err != nil {
				return 0, err
			}
			val *= rhs
		} else {
			break
		}
	}
	return val, nil
}

// Factor = Power { "^" Power }
func (p *parser) parseFactor() (float64, error) {
	val, err := p.parsePower()
	if err != nil {
		return 0, err
	}

	p.skipWhitespace()
	if p.pos < len(p.input) && p.input[p.pos] == '^' {
		p.pos++
		rhs, err := p.parseFactor()
		if err != nil {
			return 0, err
		}
		val = math.Pow(val, rhs)
	}
	return val, nil
}

// Power = [ "+" | "-" ] Primary
func (p *parser) parsePower() (float64, error) {
	p.skipWhitespace()
	if p.pos >= len(p.input) {
		return 0, ErrInvalidExpression
	}

	if p.input[p.pos] == '+' {
		p.pos++
		return p.parsePower()
	}
	if p.input[p.pos] == '-' {
		p.pos++
		val, err := p.parsePower()
		if err != nil {
			return 0, err
		}
		return -val, nil
	}

	return p.parsePrimary()
}

// Primary = ( Number | "(" Expression ")" | "sqrt" "(" Expression ")" ) { "%" }
func (p *parser) parsePrimary() (float64, error) {
	p.skipWhitespace()
	if p.pos >= len(p.input) {
		return 0, ErrInvalidExpression
	}

	var val float64
	var err error

	// Paréntesis ( Expression )
	if p.input[p.pos] == '(' {
		p.pos++
		val, err = p.parseExpression()
		if err != nil {
			return 0, err
		}
		p.skipWhitespace()
		if p.pos >= len(p.input) || p.input[p.pos] != ')' {
			return 0, ErrMismatchedParens
		}
		p.pos++
	} else if p.pos+4 <= len(p.input) && strings.ToLower(string(p.input[p.pos:p.pos+4])) == "sqrt" {
		// Raíz cuadrada: sqrt( ... )
		p.pos += 4
		p.skipWhitespace()
		if p.pos >= len(p.input) || p.input[p.pos] != '(' {
			return 0, ErrInvalidExpression
		}
		p.pos++
		val, err = p.parseExpression()
		if err != nil {
			return 0, err
		}
		p.skipWhitespace()
		if p.pos >= len(p.input) || p.input[p.pos] != ')' {
			return 0, ErrMismatchedParens
		}
		p.pos++
		if val < 0 {
			return 0, ErrNegativeSquareRoot
		}
		val = math.Sqrt(val)
	} else {
		// Lectura de números
		start := p.pos
		hasDot := false
		for p.pos < len(p.input) {
			ch := p.input[p.pos]
			if unicode.IsDigit(ch) {
				p.pos++
			} else if ch == '.' && !hasDot {
				hasDot = true
				p.pos++
			} else {
				break
			}
		}

		if start == p.pos {
			return 0, ErrInvalidExpression
		}

		numStr := string(p.input[start:p.pos])
		val, err = strconv.ParseFloat(numStr, 64)
		if err != nil {
			return 0, ErrInvalidExpression
		}
	}

	// Operador sufijo de porcentaje (%)
	for {
		p.skipWhitespace()
		if p.pos < len(p.input) && p.input[p.pos] == '%' {
			p.pos++
			val = val / 100.0
		} else {
			break
		}
	}

	return val, nil
}

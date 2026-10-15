# Etapa 1: Compilación del binario de Go
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /calculator-api ./main.go

# Etapa 2: Imagen final ultra-liviana
FROM alpine:3.19

WORKDIR /app
COPY --from=builder /calculator-api .

EXPOSE 8080

CMD ["./calculator-api"]
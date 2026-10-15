package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sezzle-calculator/backend/handlers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// Registrar rutas de la API
	mux.HandleFunc("GET /health", handlers.HealthHandler)
	mux.HandleFunc("POST /api/v1/calculate", handlers.CalculateHandler)

	// Aplicar middleware de CORS
	serverHandler := handlers.EnableCORS(mux)

	fmt.Printf("Calculator API running on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, serverHandler); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

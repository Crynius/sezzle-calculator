package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		payload        string
		expectedStatus int
		expectedResult float64
	}{
		{
			name:           "Valid multi-operation",
			method:         http.MethodPost,
			payload:        `{"expression":"3 * 3 - 6 / 8"}`,
			expectedStatus: http.StatusOK,
			expectedResult: 8.25,
		},
		{
			name:           "Division by zero",
			method:         http.MethodPost,
			payload:        `{"expression":"10 / 0"}`,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/api/v1/calculate", bytes.NewBufferString(tt.payload))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			CalculateHandler(w, req)

			if w.Code != tt.expectedStatus {
				t.Fatalf("expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedStatus == http.StatusOK {
				var resp SuccessResponse
				_ = json.NewDecoder(w.Body).Decode(&resp)
				if resp.Result != tt.expectedResult {
					t.Errorf("expected %f, got %f", tt.expectedResult, resp.Result)
				}
			}
		})
	}
}

func TestHealthHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	HealthHandler(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
}

func TestEnableCORS(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	handler := EnableCORS(next)
	req := httptest.NewRequest(http.MethodOptions, "/api/v1/calculate", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for OPTIONS, got %d", w.Code)
	}
}

package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"trackify-jobs/middleware" // wherever InitFirebaseAuth and authClient are
)

type TokenRequest struct {
	Token string `json:"token"`
}

func SetAuthCookie(w http.ResponseWriter, r *http.Request) {
	var req TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	authClient := middleware.GetFirebaseAuth()
	_, err := authClient.VerifyIDToken(context.Background(), req.Token)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	cookie := &http.Cookie{
		Name:     "auth-token",
		Value:    req.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7, // 7 days
	}
	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     "auth-token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   -1, // expire it immediately
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
}

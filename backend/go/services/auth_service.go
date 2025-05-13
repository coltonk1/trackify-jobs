package services

import (
	"context"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

var app *firebase.App

func InitFirebase() {
	ctx := context.Background()
	opt := option.WithCredentialsFile("path/to/serviceAccountKey.json")
	var err error
	app, err = firebase.NewApp(ctx, nil, opt)
	if err != nil {
		panic("failed to initialize Firebase app: " + err.Error())
	}
}

func VerifyFirebaseToken(idToken string) (bool, error) {
	ctx := context.Background()
	client, err := app.Auth(ctx)
	if err != nil {
		return false, err
	}

	_, err = client.VerifyIDToken(ctx, idToken)
	if err != nil {
		return false, err
	}

	return true, nil
}

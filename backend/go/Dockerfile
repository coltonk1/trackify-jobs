# Build Go binary
FROM golang:1.21 as builder
WORKDIR /app
COPY . .
RUN go build -o app .

# Run binary
FROM gcr.io/distroless/static
WORKDIR /
COPY --from=builder /app/app .
CMD ["./app"]

# Go Backend Guide

Welcome to the Go Backend project! This README provides all the necessary information to set up, develop, and deploy your Go application.

## Project Structure

This project follows a standard structure for a Go application:

```
project-root/
├── main.go           # Main application file and entry point
├── config/           # Configuration settings
├── database/         # Database-related files
│   ├── postgres.go   # PostgreSQL connection logic
│   ├── postgres_test.go # Unit tests
├── handlers/         # HTTP request handlers
├── middleware/       # Middleware functions
├── models/           # Data models
├── services/         # Business logic
├── .gitignore        # Files to ignore in Git
├── .env              # Environment variables
├── go.mod            # Go module definition
├── go.sum            # Go dependencies
└── README.md         # This file
```

## Getting Started

### Prerequisites

Before starting, ensure you have the following installed:

-   [Go](https://go.dev/dl/) (1.20+ recommended)
-   [PostgreSQL](https://www.postgresql.org/download/)
-   Git (for version control)

### Setting Up the Project

To start working with this project, follow these steps:

1. Clone the repository:

    ```sh
    git clone <repository_url>
    cd <project_name>
    ```

2. Install dependencies:

    ```sh
    go mod tidy
    ```

3. Configure your database:

    - Create a `.env` file from `.env.example`
    - Update the database connection settings to match your environment

4. Start the application:

    To start the server in development mode:

    ```sh
    go run main.go
    ```

    For automatic reloads, install `air`:

    ```sh
    go install github.com/cosmtrek/air@latest
    air
    ```

5. The server will start, typically on port 8080 (http://localhost:8080)

## Development Workflow

### Using an IDE

For a better development experience, consider using:

-   [VS Code](https://code.visualstudio.com/) with Go extensions
-   [GoLand](https://www.jetbrains.com/go/)

### Building the Project

To build the project without running it:

```sh
go build -o app main.go
```

Then to run it:

```sh
    ./app
```

**Important Considerations:**

-   **Permissions:** On macOS/Linux, make sure the executable has execute permissions. If not, you can add them with:

    ```bash
    chmod +x app
    ```

## Configuration

### Main Configuration

-   **config/**: Contains environment-specific configuration
-   **.env**: Contains database credentials and other settings
-   **postgres.go**: Database connection logic

### Database Configuration

This project uses PostgreSQL by default. To use a different database:

1. Update the driver in `go.mod`
2. Modify `postgres.go` for the new database driver
3. Update any database-specific queries in `services/`

## Authentication Example

This project includes middleware to protect routes using authentication tokens.

To access the example endpoint, include a valid JWT token in the `Authorization` header.

```sh
curl -H "Authorization: Bearer <your_token>" http://localhost:8080/protected
```

## Testing the API

Run tests for the database layer:

```sh
go test ./database
```

Run all tests:

```sh
go test ./...
```

### Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection for your API
3. Add requests for each endpoint
4. For protected endpoints, set up JWT authentication

### Using cURL

Example of a simple GET request:

```sh
curl http://localhost:8080/users
```

Example of a POST request with JWT authentication:

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{"name":"John Doe","email":"john@example.com"}' \
  http://localhost:8080/users
```

## Deployment

### Docker Deployment

1. Create a `Dockerfile` in your project root.
2. Build and run the Docker container:
    ```sh
    docker build -t myapp .
    docker run -p 8080:8080 myapp
    ```

### Running as a Binary

Build and run the application as a standalone binary:

```sh
go build -o app main.go
./app
```

### Cloud Platforms

-   AWS Lambda (using Go runtime)
-   Google Cloud Run
-   Heroku (via `heroku go buildpack`)
-   Azure App Service

### Traditional Hosting

1. Transfer the binary to your server
2. Run the application using a process manager like `systemd`
3. Configure environment variables appropriately

## Common Issues & Fixes

### Application Won't Start

-   Verify database is running and accessible
-   Check for port conflicts (default is 8080)
-   Ensure all required environment variables are set in `.env`

### Database Connection Issues

-   Ensure PostgreSQL is running (`pg_ctl status`)
-   Check `.env` file for correct `DATABASE_URL`

### JWT Authentication Issues

-   Ensure you're passing the `Authorization` header correctly
-   Verify that `JWT_SECRET` matches between `.env` and the service

---

Happy coding! If you have any questions or need further assistance, feel free to reach out.

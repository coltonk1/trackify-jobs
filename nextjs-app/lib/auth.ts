import jwt from "jsonwebtoken";

// Define the structure of the user payload that will be encoded in the JWT.
export interface UserPayload {
    id: string;
    email: string;
    name: string;
    password: string; // Consider excluding sensitive data like password from the payload in production.
}

// Fetch the JWT secret from environment variables (ensure it's defined in .env.local).
const JWT_SECRET = process.env.JWT_SECRET as string; // Make sure this is set in your .env.local

// EXPIRATION_TIME should be defined as an environment variable or here (e.g., '1h' for 1 hour).
const EXPIRATION_TIME = "1h";

// Function to generate a JSON Web Token (JWT) for a given user payload.
export function generateToken(user: UserPayload): string {
    // jwt.sign() creates a JWT.
    return jwt.sign(user, JWT_SECRET, { expiresIn: EXPIRATION_TIME });
}

// Function to verify a JWT and return the user payload if the token is valid.
export function verifyToken(token: string): UserPayload | null {
    try {
        // jwt.verify() decodes and verifies the token.
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
        // Handle errors during token verification, such as invalid or expired tokens.
        console.error("Invalid token:", error);
        return null; // Return null if the token is invalid.
    }
}

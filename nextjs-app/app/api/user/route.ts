// pages/api/user.js
import { query } from "@/lib/db"; // Import the database query utility
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle GET requests
    if (req.method === "GET") {
        try {
            const { id } = req.query; // Extract the 'id' query parameter from the URL.

            // If no 'id' is provided, fetch all users.
            if (!id) {
                const result = await query("SELECT * FROM users", []); // Query all users
                return res.status(200).json(result.rows); // Return all users
            }

            // If 'id' is provided, fetch the user with that specific ID.
            const result = await query("SELECT * FROM users WHERE id = $1", [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json(result.rows[0]); // Return the specific user
        } catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Handle POST requests
    if (req.method === "POST") {
        try {
            const { name, email } = req.body; // Parse the JSON data from the request body.

            if (!name || !email) {
                return res.status(400).json({ message: "Name and email are required" });
            }

            // Insert a new user into the 'users' table.
            const result = await query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);

            return res.status(201).json(result.rows[0]); // Return the newly created user
        } catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    // Return a 405 error if the method is not supported
    return res.status(405).json({ message: "Method Not Allowed" });
}

export default handler; // Export the handler function as the default

import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { query } from "@/lib/db"; // Database query utility you created earlier
import { generateToken } from "@/lib/auth"; // JWT functions from lib/auth

// Handle login request
export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const { email, password } = req.body;

            // Query the database to find the user by email
            const result = await query("SELECT id, email, password, name FROM users WHERE email = $1", [email]);

            if (result.rows.length === 0) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const user = result.rows[0];

            // Check if the provided password matches the stored hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Create a JWT token for the user
            const token = generateToken({
                id: user.id,
                email: user.email,
                name: user.name,
                password: user.password, // You might want to exclude password in production
            });

            // Set the token in the response cookie
            res.setHeader(
                "Set-Cookie",
                `sessionToken=${token}; HttpOnly; Path=/; Max-Age=3600` // Cookie for 1 hour
            );

            return res.status(200).json({ message: "Login successful" });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}

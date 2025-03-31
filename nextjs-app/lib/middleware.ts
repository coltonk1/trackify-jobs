// src/lib/server/middleware.ts

import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/auth"; // Your token verification function

// Middleware to authenticate user and attach it to the request object
export const authenticate = (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const token = req.cookies.sessionToken;

        if (!token) {
            // If there's no token, automatically return an Unauthorized response
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            const user = verifyToken(token);

            if (!user) {
                // If token verification fails, automatically return Unauthorized
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Attach the user to the req object, using 'any' to avoid TypeScript errors
            (req as any).user = user; // Type assertion here

            // Call the actual handler after successful authentication
            return handler(req, res);
        } catch (error) {
            console.error("Error during authentication", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

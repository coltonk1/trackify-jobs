// pages/api/protected.ts

import { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "@/lib/middleware"; // Import the middleware
import { UserPayload } from "@/lib/auth"; // Your user payload type

// Protected route handler that requires authentication
const protectedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Access the user attached to the request object via type assertion
    const user = (req as any).user as UserPayload;

    // If user is not set, the authenticate middleware has already returned 401
    // You can now safely access user
    return res.status(200).json({
        message: "Welcome to the protected route!",
        user: user,
    });
};

// Wrap the handler with authentication middleware
export default authenticate(protectedHandler);

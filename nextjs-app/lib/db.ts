import { Pool, QueryResult, QueryResultRow } from "pg";

// Declare a variable to hold the PostgreSQL connection pool.
let pool: Pool | undefined;

// Function to create a PostgreSQL connection pool.
function createPool(): Pool {
    if (!pool) {
        try {
            // Check if DATABASE_URL environment variable is set.
            if (process.env.DATABASE_URL) {
                // Use DATABASE_URL to create pool.
                pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: { rejectUnauthorized: false }, // Allow self-signed certificates (for development/testing).
                });
                console.log("Connected to PostgreSQL using DATABASE_URL.");
            } else {
                // Use individual environment variables to configure the pool.
                pool = new Pool({
                    user: process.env.DATABASE_USER,
                    host: process.env.DATABASE_HOST,
                    database: process.env.DATABASE_NAME,
                    password: process.env.DATABASE_PASSWORD,
                    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432, // Default port is 5432.
                    ssl: { rejectUnauthorized: false },
                });
                console.log("Connected to PostgreSQL using individual parameters.");
            }
        } catch (error) {
            console.error("Error creating PostgreSQL pool:", error);
            throw error; // Re-throw to prevent further execution.
        }
    }

    return pool;
}

// Function to get the database pool instance.
export const getPool = (): Pool => createPool();

// Function for executing queries with proper typing.
export const query = async <T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    const client = await getPool().connect();
    try {
        return await client.query<T>(text, params);
    } finally {
        client.release(); // Release the client back to the pool.
    }
};

// Function to properly close the pool during shutdown.
export async function endPool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = undefined;
        console.log("PostgreSQL pool closed.");
    }
}

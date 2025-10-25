import 'dotenv/config'
import { defineConfig } from "prisma/config";

export default defineConfig({
    engine: "classic",
    datasource: {
        directUrl: process.env.DATABASE_URL,
        shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
        url: process.env.DATABASE_URL!
    },
});

import { DiscordBot } from "./DiscordBot";
import { config } from "./config";
import * as http from "http";

// Create HTTP server for Railway health checks
const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                status: "healthy",
                timestamp: new Date().toISOString(),
            }),
        );
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

// Start HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HTTP server running on port ${PORT}`);
});

let bot: DiscordBot;

async function startBot(): Promise<void> {
    try {
        bot = new DiscordBot();
        await bot.start();
    } catch (error) {
        console.error("Failed to start bot:", error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT, shutting down gracefully...");
    if (bot) {
        await bot.shutdown();
    }
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nReceived SIGTERM, shutting down gracefully...");
    if (bot) {
        await bot.shutdown();
    }
    process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    if (bot) {
        bot.shutdown().finally(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

// Start the bot
startBot().catch((error) => {
    console.error("Fatal error during startup:", error);
    process.exit(1);
});

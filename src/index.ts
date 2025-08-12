import { DiscordBot } from "./DiscordBot";
import { config } from "./config";
import * as http from "http";

// Create HTTP server for Railway health checks
const server = http.createServer((req, res) => {
    console.log(`🌐 HTTP request: ${req.method} ${req.url}`);

    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        const healthData = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            botStatus: bot ? "running" : "starting",
            uptime: process.uptime(),
        };
        res.end(JSON.stringify(healthData, null, 2));
        console.log("✅ Health check responded successfully");
    } else if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Discord Bot is running! Use /health for status.");
    } else {
        res.writeHead(404);
        res.end("Not Found");
        console.log("❌ 404 for path:", req.url);
    }
});

// Start HTTP server FIRST (before bot)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 HTTP server running on port ${PORT}`);
    console.log(
        `🔍 Health check available at: http://localhost:${PORT}/health`,
    );
});

// Handle HTTP server errors
server.on("error", (error) => {
    console.error("❌ HTTP server error:", error);
});

let bot: DiscordBot;

async function startBot(): Promise<void> {
    try {
        console.log("🤖 Starting Discord bot...");
        bot = new DiscordBot();
        await bot.start();
        console.log("✅ Discord bot started successfully");
    } catch (error) {
        console.error("❌ Failed to start Discord bot:", error);
        console.log(
            "⚠️ Bot failed to start, but HTTP server remains available",
        );
        // Don't exit process - keep HTTP server running for health checks
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

// Start the bot after a short delay to ensure HTTP server is ready
setTimeout(() => {
    startBot().catch((error) => {
        console.error("Fatal error during bot startup:", error);
        // Don't exit process - keep HTTP server running
    });
}, 2000); // 2 second delay

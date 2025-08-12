import { DiscordBot } from "./DiscordBot";

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

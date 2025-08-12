import dotenv from "dotenv";
import { BotConfig } from "../types";

dotenv.config();

export const config: BotConfig = {
    discord: {
        token: process.env.DISCORD_TOKEN || "",
        clientId: process.env.DISCORD_CLIENT_ID || "",
        guildId: process.env.GUILD_ID || "",
    },
    chest: {
        respawnTimeMs: parseInt(process.env.CHEST_RESPAWN_TIME || "5400000"), // 1.5 hours
        notificationTimeMs: parseInt(process.env.NOTIFICATION_TIME || "900000"), // 15 minutes
    },
};

export function validateConfig(): void {
    if (!config.discord.token) {
        throw new Error("DISCORD_TOKEN is required");
    }
    if (!config.discord.clientId) {
        throw new Error("DISCORD_CLIENT_ID is required");
    }
    if (!config.discord.guildId) {
        throw new Error("GUILD_ID is required");
    }
}

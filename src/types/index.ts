export interface Chest {
    id: string;
    name: string;
    lastLooted: Date;
    respawnTime: Date;
    channelId: string;
    messageId?: string;
    isActive: boolean;
}

export interface ChestConfig {
    respawnTimeMs: number;
    notificationTimeMs: number;
}

export interface DiscordConfig {
    token: string;
    clientId: string;
    guildId: string;
}

export interface BotConfig {
    discord: DiscordConfig;
    chest: ChestConfig;
}

export interface ChestLootMessage {
    chestName: string;
    timestamp: Date;
    channelId: string;
    messageId: string;
}

export interface NotificationData {
    chest: Chest;
    timeUntilRespawn: number;
    channelId: string;
}

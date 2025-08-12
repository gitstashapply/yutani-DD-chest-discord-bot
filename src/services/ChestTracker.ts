import { Chest, ChestConfig, NotificationData } from "../types";
import { EventEmitter } from "events";

export class ChestTracker extends EventEmitter {
    private chests: Map<string, Chest> = new Map();
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private notificationTimers: Map<string, NodeJS.Timeout> = new Map();
    private config: ChestConfig;

    constructor(config: ChestConfig) {
        super();
        this.config = config;
    }

    /**
     * Add a new chest to track
     */
    addChest(chest: Chest): void {
        this.chests.set(chest.id, chest);
        this.startTracking(chest);
        this.emit("chestAdded", chest);
    }

    /**
     * Remove a chest from tracking
     */
    removeChest(chestId: string): boolean {
        const chest = this.chests.get(chestId);
        if (!chest) return false;

        this.stopTracking(chestId);
        this.chests.delete(chestId);
        this.emit("chestRemoved", chest);
        return true;
    }

    /**
     * Update chest when it's looted
     */
    updateChestLooted(
        chestId: string,
        channelId: string,
        messageId?: string,
    ): boolean {
        const chest = this.chests.get(chestId);
        if (!chest) return false;

        // Stop existing timers
        this.stopTracking(chestId);

        // Update chest data
        chest.lastLooted = new Date();
        chest.respawnTime = new Date(Date.now() + this.config.respawnTimeMs);
        chest.channelId = channelId;
        chest.messageId = messageId;
        chest.isActive = true;

        // Restart tracking
        this.startTracking(chest);
        this.emit("chestLooted", chest);
        return true;
    }

    /**
     * Get all tracked chests
     */
    getAllChests(): Chest[] {
        return Array.from(this.chests.values());
    }

    /**
     * Get a specific chest
     */
    getChest(chestId: string): Chest | undefined {
        return this.chests.get(chestId);
    }

    /**
     * Start tracking a chest
     */
    private startTracking(chest: Chest): void {
        if (!chest.isActive) return;

        const now = Date.now();
        const timeUntilRespawn = chest.respawnTime.getTime() - now;
        const timeUntilNotification = timeUntilRespawn -
            this.config.notificationTimeMs;

        // Set respawn timer
        if (timeUntilRespawn > 0) {
            const respawnTimer = setTimeout(() => {
                this.onChestRespawn(chest);
            }, timeUntilRespawn);
            this.timers.set(chest.id, respawnTimer);
        }

        // Set notification timer
        if (timeUntilNotification > 0) {
            const notificationTimer = setTimeout(() => {
                this.onChestNotification(chest);
            }, timeUntilNotification);
            this.notificationTimers.set(chest.id, notificationTimer);
        }
    }

    /**
     * Stop tracking a chest
     */
    private stopTracking(chestId: string): void {
        // Clear respawn timer
        const respawnTimer = this.timers.get(chestId);
        if (respawnTimer) {
            clearTimeout(respawnTimer);
            this.timers.delete(chestId);
        }

        // Clear notification timer
        const notificationTimer = this.notificationTimers.get(chestId);
        if (notificationTimer) {
            clearTimeout(notificationTimer);
            this.notificationTimers.delete(chestId);
        }
    }

    /**
     * Handle chest respawn
     */
    private onChestRespawn(chest: Chest): void {
        chest.isActive = false;
        this.emit("chestRespawned", chest);
        this.stopTracking(chest.id);
    }

    /**
     * Handle chest notification
     */
    private onChestNotification(chest: Chest): void {
        const timeUntilRespawn = chest.respawnTime.getTime() - Date.now();
        const notificationData: NotificationData = {
            chest,
            timeUntilRespawn,
            channelId: chest.channelId,
        };
        this.emit("chestNotification", notificationData);
    }

    /**
     * Clean up all timers
     */
    destroy(): void {
        for (const [chestId] of this.chests) {
            this.stopTracking(chestId);
        }
        this.chests.clear();
        this.timers.clear();
        this.notificationTimers.clear();
    }
}

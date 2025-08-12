import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import { ChestTracker } from "../services/ChestTracker";
import { MessageParser } from "../services/MessageParser";
import { Chest } from "../types";

export class ChestCommands {
    constructor(private chestTracker: ChestTracker) {}

    /**
     * Get a formatted list of available chest names for error messages
     */
    private getAvailableChestNames(): string {
        const chests = this.chestTracker.getAllChests();
        if (chests.length === 0) {
            return "No chests available";
        }
        return chests.map((chest) => `"${chest.name}"`).join(", ");
    }

    /**
     * Get the slash command data for chest commands
     */
    getCommandData() {
        return new SlashCommandBuilder()
            .setName("chest")
            .setDescription("Manage chest tracking for Dune Awakening")
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("create")
                    .setDescription(
                        "Create a new chest to track (inactive until looted)",
                    )
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Name of the chest to track")
                            .setRequired(true)
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("list")
                    .setDescription("List all tracked chests"),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("remove")
                    .setDescription("Remove a chest from tracking")
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Name of the chest to remove")
                            .setRequired(true)
                    ),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("status")
                    .setDescription("Show status of all chests"),
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName("looted")
                    .setDescription(
                        "Mark an existing chest as looted and start respawn timer",
                    )
                    .addStringOption((option) =>
                        option
                            .setName("name")
                            .setDescription("Name of the chest that was looted")
                            .setRequired(true)
                    ),
            );
    }

    /**
     * Handle chest command interactions
     */
    async handleCommand(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "create":
                await this.handleCreate(interaction);
                break;
            case "list":
                await this.handleList(interaction);
                break;
            case "remove":
                await this.handleRemove(interaction);
                break;
            case "status":
                await this.handleStatus(interaction);
                break;
            case "looted":
                await this.handleLooted(interaction);
                break;
            case "loot":
                await this.handleLoot(interaction);
                break;
            default:
                await interaction.reply({
                    content: "Unknown subcommand",
                    ephemeral: true,
                });
        }
    }

    /**
     * Handle create chest command
     */
    private async handleCreate(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chestName = interaction.options.getString("name", true);
        const chestId = MessageParser.generateChestId(chestName);

        // Check if chest already exists
        if (this.chestTracker.getChest(chestId)) {
            await interaction.reply({
                content: `Chest "${chestName}" is already being tracked!`,
                ephemeral: true,
            });
            return;
        }

        // Create new chest
        const chest: Chest = {
            id: chestId,
            name: chestName,
            lastLooted: new Date(),
            respawnTime: new Date(Date.now() + 5400000), // 1.5 hours
            channelId: interaction.channelId,
            isActive: false,
        };

        this.chestTracker.addChest(chest);

        const embed = new EmbedBuilder()
            .setTitle("✅ Chest Added")
            .setDescription(`Chest "${chestName}" has been added to tracking.`)
            .setColor("#00ff00")
            .addFields(
                { name: "Name", value: chestName, inline: true },
                {
                    name: "Status",
                    value: "Inactive (waiting for loot)",
                    inline: true,
                },
                {
                    name: "Respawn Time",
                    value: "1.5 hours after loot",
                    inline: true,
                },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Handle list chests command
     */
    private async handleList(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chests = this.chestTracker.getAllChests();

        if (chests.length === 0) {
            await interaction.reply({
                content: "No chests are currently being tracked.",
                ephemeral: true,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("📦 Tracked Chests")
            .setDescription(`Currently tracking ${chests.length} chest(s)`)
            .setColor("#0099ff")
            .setTimestamp();

        chests.forEach((chest) => {
            const status = chest.isActive ? "🟠 Looted" : "🟢 Respawned";
            const timeUntilRespawn = chest.isActive
                ? this.formatTimeUntilRespawn(chest.respawnTime)
                : "N/A";

            embed.addFields({
                name: chest.name,
                value: `Status: ${status}\nRespawn: ${timeUntilRespawn}`,
                inline: true,
            });
        });

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Handle remove chest command
     */
    private async handleRemove(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chestName = interaction.options.getString("name", true);
        const chestId = MessageParser.generateChestId(chestName);

        const removed = this.chestTracker.removeChest(chestId);

        if (removed) {
            await interaction.reply({
                content:
                    `✅ Chest "${chestName}" has been removed from tracking.`,
                ephemeral: true,
            });
        } else {
            const availableChests = this.getAvailableChestNames();
            await interaction.reply({
                content:
                    `❌ No chest with name "${chestName}" available. Available options are: ${availableChests}`,
                ephemeral: true,
            });
        }
    }

    /**
     * Handle status command
     */
    private async handleStatus(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chests = this.chestTracker.getAllChests();

        if (chests.length === 0) {
            await interaction.reply({
                content: "No chests are currently being tracked.",
                ephemeral: true,
            });
            return;
        }

        const activeChests = chests.filter((chest) => chest.isActive);
        const inactiveChests = chests.filter((chest) => !chest.isActive);

        const embed = new EmbedBuilder()
            .setTitle("📊 Chest Status Overview")
            .setDescription(`Tracking ${chests.length} total chest(s)`)
            .setColor("#0099ff")
            .setTimestamp();

        if (activeChests.length > 0) {
            embed.addFields({
                name: `🟠 Looted chests (${activeChests.length})`,
                value: activeChests.map((chest) =>
                    `**${chest.name}**: Respawns in ${
                        this.formatTimeUntilRespawn(chest.respawnTime)
                    }`
                ).join("\n"),
                inline: false,
            });
        }

        if (inactiveChests.length > 0) {
            embed.addFields({
                name: `🟢 Respawned chests (${inactiveChests.length})`,
                value: inactiveChests.map((chest) =>
                    `**${chest.name}**: Waiting for loot`
                ).join("\n"),
                inline: false,
            });
        }

        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Handle looted chest command
     */
    private async handleLooted(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chestName = interaction.options.getString("name", true);
        const chestId = MessageParser.generateChestId(chestName);

        // Check if chest exists
        let chest = this.chestTracker.getChest(chestId);

        if (chest) {
            // Update existing chest
            this.chestTracker.updateChestLooted(
                chestId,
                interaction.channelId,
                interaction.id,
            );

            const embed = new EmbedBuilder()
                .setTitle("🔄 Chest Timer Updated")
                .setDescription(`Chest "${chestName}" timer has been reset!`)
                .setColor("#ff6600")
                .addFields(
                    { name: "Chest Name", value: chestName, inline: true },
                    {
                        name: "Looted At",
                        value: new Date().toLocaleString(),
                        inline: true,
                    },
                    { name: "Next Respawn", value: "1.5 hours", inline: true },
                )
                .setFooter({ text: "Timer started - 1.5 hours until respawn" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            // Chest doesn't exist, show error with available options
            const availableChests = this.getAvailableChestNames();
            await interaction.reply({
                content:
                    `❌ No chest with name "${chestName}" available. Available options are: ${availableChests}`,
                ephemeral: true,
            });
        }
    }

    /**
     * Handle loot command (creates chest if it doesn't exist)
     */
    private async handleLoot(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const chestName = interaction.options.getString("name", true);
        const chestId = MessageParser.generateChestId(chestName);

        // Check if chest exists
        let chest = this.chestTracker.getChest(chestId);

        if (chest) {
            // Update existing chest
            this.chestTracker.updateChestLooted(
                chestId,
                interaction.channelId,
                interaction.id,
            );

            const embed = new EmbedBuilder()
                .setTitle("🔄 Chest Timer Updated")
                .setDescription(`Chest "${chestName}" timer has been reset!`)
                .setColor("#ff6600")
                .addFields(
                    { name: "Chest Name", value: chestName, inline: true },
                    {
                        name: "Looted At",
                        value: new Date().toLocaleString(),
                        inline: true,
                    },
                    { name: "Next Respawn", value: "1.5 hours", inline: true },
                )
                .setFooter({ text: "Timer started - 1.5 hours until respawn" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            // Create new chest and start tracking
            const newChest: Chest = {
                id: chestId,
                name: chestName,
                lastLooted: new Date(),
                respawnTime: new Date(Date.now() + 5400000), // 1.5 hours
                channelId: interaction.channelId,
                messageId: interaction.id,
                isActive: true,
            };

            this.chestTracker.addChest(newChest);

            const embed = new EmbedBuilder()
                .setTitle("📦 Chest Looted")
                .setDescription(
                    `Chest "${chestName}" has been looted and added to tracking!`,
                )
                .setColor("#ff6600")
                .addFields(
                    { name: "Chest Name", value: chestName, inline: true },
                    {
                        name: "Looted At",
                        value: new Date().toLocaleString(),
                        inline: true,
                    },
                    { name: "Next Respawn", value: "1.5 hours", inline: true },
                )
                .setFooter({ text: "Timer started - 1.5 hours until respawn" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }

    /**
     * Format time until respawn in a human-readable format
     */
    private formatTimeUntilRespawn(respawnTime: Date): string {
        const now = new Date();
        const timeDiff = respawnTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
            return "Ready to respawn";
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}

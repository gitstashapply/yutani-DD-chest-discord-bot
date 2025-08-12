import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    Interaction,
    Message,
    REST,
    Routes,
} from "discord.js";
import { config, validateConfig } from "./config";
import { ChestTracker } from "./services/ChestTracker";
import { MessageParser } from "./services/MessageParser";
import { NotificationService } from "./services/NotificationService";
import { ChestCommands } from "./commands/ChestCommands";
import { Chest } from "./types";

export class DiscordBot {
    private client: Client;
    private chestTracker: ChestTracker;
    private notificationService: NotificationService;
    private chestCommands: ChestCommands;
    private commands: Collection<string, any>;
    private clickedButtons: Set<string> = new Set(); // Track clicked buttons

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.chestTracker = new ChestTracker(config.chest);
        this.notificationService = new NotificationService(this.client);
        this.chestCommands = new ChestCommands(this.chestTracker);
        this.commands = new Collection();

        this.setupEventHandlers();
        this.setupChestTrackerEvents();
    }

    /**
     * Initialize and start the bot
     */
    async start(): Promise<void> {
        try {
            validateConfig();
            console.log("Configuration validated successfully");

            // Register slash commands
            await this.registerCommands();
            console.log("Slash commands registered");

            // Login to Discord
            await this.client.login(config.discord.token);
            console.log("Bot logged in successfully");
        } catch (error) {
            console.error("Failed to start bot:", error);
            process.exit(1);
        }
    }

    /**
     * Setup Discord event handlers
     */
    private setupEventHandlers(): void {
        // Bot ready event
        this.client.on(Events.ClientReady, () => {
            console.log(`Bot is ready! Logged in as ${this.client.user?.tag}`);
        });

        // Message event for chest detection - DISABLED since we use slash commands now
        // this.client.on(Events.MessageCreate, async (message: Message) => {
        //     await this.handleMessage(message);
        // });

        // Interaction event for slash commands and buttons
        this.client.on(
            Events.InteractionCreate,
            async (interaction: Interaction) => {
                if (interaction.isChatInputCommand()) {
                    await this.handleSlashCommand(interaction);
                } else if (interaction.isButton()) {
                    await this.handleButtonInteraction(interaction);
                }
            },
        );

        // Error handling
        this.client.on(Events.Error, (error) => {
            console.error("Discord client error:", error);
        });
    }

    /**
     * Setup chest tracker event handlers
     */
    private setupChestTrackerEvents(): void {
        this.chestTracker.on("chestLooted", async (chest: Chest) => {
            await this.notificationService.sendLootedNotification(chest);
        });

        this.chestTracker.on("chestNotification", async (notificationData) => {
            await this.notificationService.sendRespawnNotification(
                notificationData,
            );
        });

        this.chestTracker.on("chestRespawned", async (chest: Chest) => {
            await this.notificationService.sendRespawnedNotification(chest);
        });
    }

    // Message handling removed - using slash commands instead

    /**
     * Handle slash command interactions
     */
    private async handleSlashCommand(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        try {
            if (interaction.commandName === "chest") {
                await this.chestCommands.handleCommand(interaction);
            } else {
                await interaction.reply({
                    content: "Unknown command",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("Error handling slash command:", error);
            await interaction.reply({
                content: "An error occurred while processing your command.",
                ephemeral: true,
            });
        }
    }

    /**
     * Handle button interactions
     */
    private async handleButtonInteraction(
        interaction: ButtonInteraction,
    ): Promise<void> {
        try {
            // Check if this button has already been clicked
            if (this.clickedButtons.has(interaction.message.id)) {
                await interaction.reply({
                    content:
                        "❌ These buttons have already been used by someone else.",
                    ephemeral: true,
                });
                return;
            }

            const [action, chestId] = interaction.customId.split("_");

            if (action === "chest") {
                if (interaction.customId.startsWith("chest_claimed_")) {
                    // Extract the actual chest ID from the button custom ID
                    const actualChestId = interaction.customId.replace(
                        "chest_claimed_",
                        "",
                    );

                    // Get the chest and restart its timer
                    const chest = this.chestTracker.getChest(actualChestId);
                    if (chest) {
                        // Mark this message as clicked
                        this.clickedButtons.add(interaction.message.id);

                        // Restart the timer for this chest
                        this.chestTracker.updateChestLooted(
                            actualChestId,
                            interaction.channelId,
                            interaction.id,
                        );

                        await interaction.reply({
                            content:
                                `✅ Chest "${chest.name}" claimed! Timer has been restarted to 1.5 hours.`,
                            ephemeral: true,
                        });

                        // Disable the buttons so no one else can click them
                        await this.disableButtons(interaction);
                    } else {
                        await interaction.reply({
                            content:
                                "❌ Chest not found. It may have been removed from tracking.",
                            ephemeral: true,
                        });
                    }
                } else if (interaction.customId.startsWith("chest_missed_")) {
                    // Mark this message as clicked
                    this.clickedButtons.add(interaction.message.id);

                    await interaction.reply({
                        content: "❌ Chest missed. Better luck next time!",
                        ephemeral: true,
                    });

                    // Disable the buttons so no one else can click them
                    await this.disableButtons(interaction);
                }
            }
        } catch (error) {
            console.error("Error handling button interaction:", error);
            await interaction.reply({
                content: "An error occurred while processing your interaction.",
                ephemeral: true,
            });
        }
    }

    /**
     * Disable buttons after they've been clicked
     */
    private async disableButtons(
        interaction: ButtonInteraction,
    ): Promise<void> {
        try {
            // Create disabled versions of the buttons
            const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`chest_claimed_${Date.now()}_disabled`)
                        .setLabel("I Got It!")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("✅")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(`chest_missed_${Date.now()}_disabled`)
                        .setLabel("Missed It")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("❌")
                        .setDisabled(true),
                );

            // Update the message to disable the buttons
            await interaction.message.edit({
                components: [disabledRow],
            });

            // Clean up old clicked button records to prevent memory leaks
            this.cleanupClickedButtons();
        } catch (error) {
            console.error("Failed to disable buttons:", error);
        }
    }

    /**
     * Clean up old clicked button records to prevent memory leaks
     */
    private cleanupClickedButtons(): void {
        // Keep only the last 1000 clicked buttons to prevent memory leaks
        if (this.clickedButtons.size > 1000) {
            const buttonArray = Array.from(this.clickedButtons);
            this.clickedButtons = new Set(buttonArray.slice(-500));
        }
    }

    /**
     * Register slash commands with Discord
     */
    private async registerCommands(): Promise<void> {
        try {
            const rest = new REST({ version: "10" }).setToken(
                config.discord.token,
            );

            const commandData = this.chestCommands.getCommandData().toJSON();

            await rest.put(
                Routes.applicationGuildCommands(
                    config.discord.clientId,
                    config.discord.guildId,
                ),
                { body: [commandData] },
            );

            console.log("Successfully registered slash commands");
        } catch (error) {
            console.error("Error registering slash commands:", error);
            throw error;
        }
    }

    /**
     * Gracefully shutdown the bot
     */
    async shutdown(): Promise<void> {
        console.log("Shutting down bot...");
        this.chestTracker.destroy();
        this.client.destroy();
        console.log("Bot shutdown complete");
    }
}

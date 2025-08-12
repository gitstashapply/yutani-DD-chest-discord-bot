import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { Chest, NotificationData } from "../types";

export class NotificationService {
    constructor(private client: Client) {}

    /**
     * Send a notification that a chest will respawn soon
     */
    async sendRespawnNotification(
        notificationData: NotificationData,
    ): Promise<void> {
        const { chest, timeUntilRespawn, channelId } = notificationData;

        try {
            const channel = await this.client.channels.fetch(
                channelId,
            ) as TextChannel;
            if (!channel) {
                console.error(
                    `Could not find channel ${channelId} for notification`,
                );
                return;
            }

            const minutesUntilRespawn = Math.ceil(
                timeUntilRespawn / (1000 * 60),
            );

            const embed = new EmbedBuilder()
                .setTitle("⚠️ Chest Respawn Alert")
                .setDescription(`**${chest.name}** will respawn soon!`)
                .setColor("#ff9900")
                .addFields(
                    { name: "Chest Name", value: chest.name, inline: true },
                    {
                        name: "Time Until Respawn",
                        value: `${minutesUntilRespawn} minutes`,
                        inline: true,
                    },
                    {
                        name: "Last Looted",
                        value: chest.lastLooted.toLocaleString(),
                        inline: true,
                    },
                )
                .setFooter({ text: "Get ready to loot!" })
                .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`chest_claimed_${chest.id}`)
                        .setLabel("I Got It!")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("✅"),
                    new ButtonBuilder()
                        .setCustomId(`chest_missed_${chest.id}`)
                        .setLabel("Missed It")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("❌"),
                );

            await channel.send({
                content:
                    `🎯 **${chest.name}** will respawn in ${minutesUntilRespawn} minutes!`,
                embeds: [embed],
                components: [row],
            });

            console.log(`Sent respawn notification for chest: ${chest.name}`);
        } catch (error) {
            console.error(
                `Failed to send respawn notification for chest ${chest.name}:`,
                error,
            );
        }
    }

    /**
     * Send a notification that a chest has respawned
     */
    async sendRespawnedNotification(chest: Chest): Promise<void> {
        try {
            const channel = await this.client.channels.fetch(
                chest.channelId,
            ) as TextChannel;
            if (!channel) {
                console.error(
                    `Could not find channel ${chest.channelId} for respawn notification`,
                );
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("🎉 Chest Respawned!")
                .setDescription(
                    `**${chest.name}** has respawned and is ready to loot!`,
                )
                .setColor("#00ff00")
                .addFields(
                    { name: "Chest Name", value: chest.name, inline: true },
                    {
                        name: "Last Looted",
                        value: chest.lastLooted.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Respawn Time",
                        value: new Date().toLocaleString(),
                        inline: true,
                    },
                )
                .setFooter({ text: "Happy hunting!" })
                .setTimestamp();

            await channel.send({
                content: `🎯 **${chest.name}** has respawned! Go get it!`,
                embeds: [embed],
            });

            console.log(`Sent respawned notification for chest: ${chest.name}`);
        } catch (error) {
            console.error(
                `Failed to send respawned notification for chest ${chest.name}:`,
                error,
            );
        }
    }

    /**
     * Send a notification that a chest was looted
     */
    async sendLootedNotification(chest: Chest): Promise<void> {
        try {
            const channel = await this.client.channels.fetch(
                chest.channelId,
            ) as TextChannel;
            if (!channel) {
                console.error(
                    `Could not find channel ${chest.channelId} for loot notification`,
                );
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("📦 Chest Looted")
                .setDescription(`**${chest.name}** has been looted!`)
                .setColor("#ff6600")
                .addFields(
                    { name: "Chest Name", value: chest.name, inline: true },
                    {
                        name: "Looted At",
                        value: chest.lastLooted.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Next Respawn",
                        value: chest.respawnTime.toLocaleString(),
                        inline: true,
                    },
                )
                .setFooter({ text: "Timer started - 1.5 hours until respawn" })
                .setTimestamp();

            await channel.send({
                content:
                    `📦 **${chest.name}** was looted! Timer reset to 1.5 hours.`,
                embeds: [embed],
            });

            console.log(`Sent looted notification for chest: ${chest.name}`);
        } catch (error) {
            console.error(
                `Failed to send looted notification for chest ${chest.name}:`,
                error,
            );
        }
    }

    /**
     * Send a general status update to a channel
     */
    async sendStatusUpdate(
        channelId: string,
        message: string,
        embed?: EmbedBuilder,
    ): Promise<void> {
        try {
            const channel = await this.client.channels.fetch(
                channelId,
            ) as TextChannel;
            if (!channel) {
                console.error(
                    `Could not find channel ${channelId} for status update`,
                );
                return;
            }

            if (embed) {
                await channel.send({ content: message, embeds: [embed] });
            } else {
                await channel.send(message);
            }
        } catch (error) {
            console.error(
                `Failed to send status update to channel ${channelId}:`,
                error,
            );
        }
    }
}

const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [
    {
        name: "chest",
        description: "Manage chest tracking for Dune Awakening",
        options: [
            {
                name: "create",
                description:
                    "Create a new chest to track (inactive until looted)",
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: "name",
                        description: "Name of the chest to track",
                        type: 3, // STRING
                        required: true,
                    },
                ],
            },
            {
                name: "list",
                description: "List all tracked chests",
                type: 1, // SUB_COMMAND
            },
            {
                name: "remove",
                description: "Remove a chest from tracking",
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: "name",
                        description: "Name of the chest to remove",
                        type: 3, // STRING
                        required: true,
                    },
                ],
            },
            {
                name: "status",
                description: "Show status of all chests",
                type: 1, // SUB_COMMAND
            },
            {
                name: "looted",
                description:
                    "Mark an existing chest as looted and start respawn timer",
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: "name",
                        description: "Name of the chest that was looted",
                        type: 3, // STRING
                        required: true,
                    },
                ],
            },
        ],
    },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID,
                process.env.GUILD_ID,
            ),
            { body: commands },
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();

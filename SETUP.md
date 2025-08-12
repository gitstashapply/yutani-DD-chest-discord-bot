# Discord Bot Setup Guide

This guide will walk you through setting up the Dune Awakening Chest Bot for
your Discord guild.

## Prerequisites

- Node.js 18+ installed on your system
- A Discord account with permissions to create applications
- Access to a Discord guild where you want to use the bot

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Dune Chest Bot")
4. Click "Create"

## Step 2: Create a Bot User

1. In your application, go to the "Bot" section in the left sidebar
2. Click "Add Bot"
3. Give your bot a username
4. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent
5. Save your changes

## Step 3: Get Your Bot Token

1. In the Bot section, click "Reset Token" to reveal your bot token
2. **IMPORTANT**: Copy this token and keep it secure. Never share it publicly!
3. This is your `DISCORD_TOKEN`

## Step 4: Get Your Application ID

1. In the "General Information" section, copy the "Application ID"
2. This is your `DISCORD_CLIENT_ID`

## Step 5: Get Your Guild ID

1. In Discord, enable Developer Mode:
   - Go to User Settings → Advanced → Developer Mode
2. Right-click on your guild name and select "Copy ID"
3. This is your `GUILD_ID`

## Step 6: Invite Bot to Your Guild

1. In the Developer Portal, go to "OAuth2" → "URL Generator"
2. Select the following scopes:
   - `bot`
   - `applications.commands`
3. Select the following bot permissions:
   - Send Messages
   - Read Message History
   - Use Slash Commands
   - Manage Messages
   - Embed Links
4. Copy the generated URL and open it in your browser
5. Select your guild and authorize the bot

## Step 7: Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_application_id_here
   GUILD_ID=your_guild_id_here

   # Optional: Customize timing (in milliseconds)
   CHEST_RESPAWN_TIME=5400000
   NOTIFICATION_TIME=900000
   ```

## Step 8: Install Dependencies and Build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Step 9: Deploy Slash Commands

1. Deploy the slash commands to Discord:
   ```bash
   npm run deploy-commands
   ```

2. You should see: "Successfully reloaded application (/) commands."

## Step 10: Start the Bot

1. Start the bot:
   ```bash
   npm start
   ```

2. You should see: "Bot is ready! Logged in as [BotName]"

## Step 11: Test the Bot

1. In your Discord guild, try the slash command: `/chest list`
2. The bot should respond with a list of tracked chests (empty initially)

## Usage Examples

### Adding a Chest

```
/chest add name:North Dune Chest
```

### Checking Status

```
/chest status
```

### Automatic Detection

The bot automatically detects messages like:

- "I looted the North Dune chest"
- "Found a chest in the desert"
- "Opened the treasure chest"

## Troubleshooting

### Bot Not Responding

- Check that the bot is online in your guild
- Verify the bot has the required permissions
- Check the console for error messages

### Commands Not Working

- Run `npm run deploy-commands` again
- Ensure the bot has the "Use Slash Commands" permission
- Check that the bot is in the correct guild

### Permission Errors

- Verify the bot has all required permissions
- Check that the bot role is above other roles it needs to interact with

### Environment Variable Issues

- Ensure `.env` file exists and has correct values
- Check that all required variables are set
- Verify no extra spaces or quotes around values

## Security Notes

- Never commit your `.env` file to version control
- Keep your bot token secure
- Regularly rotate your bot token if compromised
- Only invite the bot to guilds you trust

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify all configuration values are correct
3. Ensure the bot has proper permissions
4. Check that Discord services are operational

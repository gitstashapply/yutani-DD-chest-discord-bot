# Dune Awakening Chest Bot

A Discord bot for tracking chest respawns in Dune Awakening PvP zones. The bot
monitors messages for chest loot notifications and tracks respawn timers,
notifying guild members 15 minutes before chests respawn.

## Features

- **Automatic Chest Detection**: Monitors Discord messages for chest loot
  notifications
- **Respawn Timer Tracking**: Tracks 1.5-hour respawn timers for each chest
- **Smart Notifications**: Alerts guild members 15 minutes before chest respawns
- **Multiple Chest Support**: Can track multiple chests simultaneously
- **TypeScript**: Built with TypeScript for better development experience

## Setup

### Prerequisites

- Node.js 18+
- Discord Bot Token
- Discord Application with Bot permissions

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `env.example` to `.env` and fill in your configuration:
   ```bash
   cp env.example .env
   ```

4. Configure your `.env` file:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   GUILD_ID=your_guild_id_here
   ```

5. Build the project:
   ```bash
   npm run build
   ```

6. Start the bot:
   ```bash
   npm start
   ```

### Development

For development with auto-reload:

```bash
npm run dev
```

For watching file changes:

```bash
npm run watch
```

## Usage

### Commands

- `/chest add <name>` - Add a new chest to track
- `/chest list` - List all tracked chests
- `/chest remove <name>` - Remove a chest from tracking
- `/chest status` - Show status of all chests

### Chest Detection

The bot automatically detects chest loot messages containing keywords like:

- "looted chest"
- "found chest"
- "opened chest"
- "chest looted"

### Configuration

- **CHEST_RESPAWN_TIME**: Time in milliseconds for chest respawn (default: 1.5
  hours = 5400000ms)
- **NOTIFICATION_TIME**: Time in milliseconds before respawn to send
  notification (default: 15 minutes = 900000ms)

## Bot Permissions

The bot requires the following Discord permissions:

- Send Messages
- Read Message History
- Use Slash Commands
- Manage Messages (for cleanup)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

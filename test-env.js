// Simple test script to verify environment variables
require("dotenv").config();

console.log("🔍 Environment Variables Test:");
console.log("==============================");
console.log(
    "DISCORD_TOKEN:",
    process.env.DISCORD_TOKEN ? "✅ Set" : "❌ Missing",
);
console.log(
    "DISCORD_CLIENT_ID:",
    process.env.DISCORD_CLIENT_ID ? "✅ Set" : "❌ Missing",
);
console.log("GUILD_ID:", process.env.GUILD_ID ? "✅ Set" : "❌ Missing");
console.log(
    "CHEST_RESPAWN_TIME:",
    process.env.CHEST_RESPAWN_TIME ? "✅ Set" : "❌ Missing",
);
console.log(
    "NOTIFICATION_TIME:",
    process.env.NOTIFICATION_TIME ? "✅ Set" : "❌ Missing",
);

if (!process.env.DISCORD_TOKEN) {
    console.log("\n❌ DISCORD_TOKEN is missing!");
    process.exit(1);
}

console.log("\n✅ All required environment variables are set!");

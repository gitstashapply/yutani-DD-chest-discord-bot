import { ChestLootMessage } from "../types";

export class MessageParser {
    // More flexible keywords that can appear anywhere in the message
    private static readonly CHEST_KEYWORDS = [
        "looted",
        "found",
        "opened",
        "got",
        "loot",
        "chest",
    ];

    // Multiple patterns to catch different message formats
    private static readonly CHEST_NAME_PATTERNS = [
        // "looted chest D4" or "chest looted D4"
        /(?:looted|found|opened|got|loot)\s+(?:the\s+)?chest\s+([a-zA-Z0-9\s\-_]+)/i,

        // "chest looted D4" or "chest D4 looted"
        /chest\s+([a-zA-Z0-9\s\-_]+)\s+(?:looted|found|opened|got|loot)/i,

        // "D4 chest" or "d4 chest"
        /([a-zA-Z0-9\s\-_]+)\s+chest/i,

        // "looted D4" or "D4 looted" (without "chest" word)
        /(?:looted|found|opened|got|loot)\s+([a-zA-Z0-9\s\-_]+)/i,

        // "D4" alone (if message contains chest-related keywords)
        /^([a-zA-Z0-9\s\-_]+)$/i,
    ];

    /**
     * Check if a message contains chest loot information
     */
    static isChestLootMessage(content: string): boolean {
        const lowerContent = content.toLowerCase();

        // Check if message contains any chest-related keywords
        const hasKeyword = this.CHEST_KEYWORDS.some((keyword) =>
            lowerContent.includes(keyword)
        );

        console.log(
            `🔍 Checking message: "${content}" -> hasKeyword: ${hasKeyword}`,
        );
        return hasKeyword;
    }

    /**
     * Extract chest name from a loot message
     */
    static extractChestName(content: string): string | null {
        console.log(`🔍 Extracting chest name from: "${content}"`);

        // Try all patterns in order
        for (const pattern of this.CHEST_NAME_PATTERNS) {
            const match = content.match(pattern);
            if (match && match[1]) {
                const chestName = match[1].trim();
                if (chestName && chestName.length > 0) {
                    // Additional validation for the last pattern (standalone names)
                    if (pattern.source === "^([a-zA-Z0-9\\s\\-_]+)$") {
                        // For standalone names, make sure it's not just a common word
                        const lowerName = chestName.toLowerCase();
                        const commonWords = [
                            "the",
                            "a",
                            "an",
                            "and",
                            "or",
                            "but",
                            "in",
                            "on",
                            "at",
                            "to",
                            "for",
                            "of",
                            "with",
                            "by",
                        ];
                        if (commonWords.includes(lowerName)) {
                            continue; // Skip common words, try next pattern
                        }
                    }

                    console.log(`✅ Pattern match found: "${chestName}"`);
                    return chestName;
                }
            }
        }

        // Special case: if message is just a chest name (like "D4" or "d4")
        const trimmedContent = content.trim();
        if (
            /^[a-zA-Z0-9\s\-_]+$/.test(trimmedContent) &&
            trimmedContent.length > 0
        ) {
            console.log(`✅ Standalone chest name found: "${trimmedContent}"`);
            return trimmedContent;
        }

        console.log(`❌ No chest name extracted`);
        return null;
    }

    /**
     * Parse a Discord message for chest loot information
     */
    static parseMessage(
        content: string,
        channelId: string,
        messageId: string,
    ): ChestLootMessage | null {
        if (!this.isChestLootMessage(content)) {
            return null;
        }

        const chestName = this.extractChestName(content);
        if (!chestName) {
            return null;
        }

        return {
            chestName,
            timestamp: new Date(),
            channelId,
            messageId,
        };
    }

    /**
     * Generate a standardized chest ID from name
     */
    static generateChestId(chestName: string): string {
        return chestName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }
}

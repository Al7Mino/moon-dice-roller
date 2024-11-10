import { join } from "path";

export const rootDir = join(__dirname, "..", "..");
export const srcDir = join(rootDir, "src");

export const RandomLoadingMessage = ["Computing...", "Thinking...", "Cooking some food", "Give me a moment", "Loading..."];

/*
 * Message limits
 */

/** Discord message content limited to 2000 characters */
export const MessageContentLimit = 2000;
/** Discord message rich embeds limited to 10 */
export const MessageNbEmbedsLimit = 10;
/** Discord message rich embeds content limited to 6000 characters */
export const EmbedBuildersLimit = 6000;

/*
 * Embeds limits
 */

/** Discord embed title limited to 256 characters */
export const EmbedTitleLimit = 256;
/** Discord embed description limited to 4096 characters */
export const EmbedDescriptionLimit = 4096;
/** Discord embed fields limited to 25 */
export const EmbedNbFieldLimit = 25;
/** Discord embed fields name limited to 256 characters */
export const EmbedFieldNameLimit = 256;
/** Discord embed fields value limited to 1024 characters */
export const EmbedFieldValueLimit = 1024;
/** Discord embed footer limited to 2048 characters */
export const EmbedFooterLimit = 2048;
/** Discord embed author name limited to 256 characters */
export const EmbedAuthorLimit = 256;

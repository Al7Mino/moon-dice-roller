import type { ChatInputCommandSuccessPayload, Command, ContextMenuCommandSuccessPayload, MessageCommandSuccessPayload } from "@sapphire/framework";
import { container } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import { cyan } from "colorette";
import { BaseMessageOptions, Guild, Message, EmbedBuilder, User, APIEmbed, APIEmbedField, JSONEncodable } from "discord.js";
import {
	EmbedDescriptionLimit,
	EmbedFieldNameLimit,
	EmbedFieldValueLimit,
	EmbedNbFieldLimit,
	EmbedTitleLimit,
	MessageContentLimit,
	EmbedBuildersLimit,
	RandomLoadingMessage,
} from "./constants";

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

/**
 * Sends a loading message to the current channel
 * @param message The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
	return send(message, { embeds: [new EmbedBuilder().setDescription(pickRandom(RandomLoadingMessage)).setColor("#FF0000")] });
}

export function logSuccessCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload): void {
	let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

	if ("interaction" in payload) {
		successLoggerData = getSuccessLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
	} else {
		successLoggerData = getSuccessLoggerData(payload.message.guild, payload.message.author, payload.command);
	}

	container.logger.debug(`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const sentAt = getGuildInfo(guild);

	return { shard, commandName, author, sentAt };
}

function getShardInfo(id: number) {
	return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
	return cyan(command.name);
}

function getAuthorInfo(author: User) {
	return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
	if (guild === null) return "Direct Messages";
	return `${guild.name}[${cyan(guild.id)}]`;
}

/**
 * Split a text in several parts when it is larger than `limit`.
 * The text is splitted smartly, by searching last space.
 * @param text Text to split
 * @param limit Limit number of characters
 */
function smartTextSplit(text: string, limit: number): string[] {
	if (text.length <= limit) {
		return [text];
	}
	const texts: string[] = [];
	let string = text;
	do {
		const substring = string.substring(0, limit);
		const delta = 100;
		const lastIndexSpace = substring.lastIndexOf(" ");
		const lastIndexLinebreak = substring.lastIndexOf("\n");
		const lastIndex = lastIndexSpace - lastIndexLinebreak <= delta ? lastIndexLinebreak : lastIndexSpace;
		const smartSubstring = string.substring(0, lastIndex);
		texts.push(smartSubstring);
		string = string.substring(lastIndex);
	} while (string.length > limit);
	texts.push(string);
	return texts;
}

/**
 * Get the total length of texts include in embed fields
 * @param fields Array of embed fields
 */
function getEmbedFieldsSize(fields: APIEmbedField[]): number {
	let size = 0;
	for (const field of fields) {
		size += field.name.length;
		size += field.value.length;
	}
	return size;
}

/**
 * Split embed fields into several ones if the total size is too high.\
 * *This method suppose that each embed field individually is valid.*
 * @param fields Array of embed fields
 * @returns Group of valid array of embed fields
 */
function splitEmbedFields(fields: APIEmbedField[], limit = EmbedBuildersLimit): APIEmbedField[][] {
	if (getEmbedFieldsSize(fields) <= limit) {
		return [fields];
	}
	const result: APIEmbedField[][] = [];
	let groupFields: APIEmbedField[] = [];
	let totalSize = 0;
	for (const field of fields) {
		const fieldSize = getEmbedFieldsSize([field]);
		totalSize += fieldSize;
		if (totalSize > limit) {
			result.push(groupFields);
			groupFields = [];
			totalSize = fieldSize;
		}
		groupFields.push(field);
	}
	return result;
}

/**
 * Split one embed field into several ones if needed (depending on embed field limits)
 * @param field Embed field
 * @returns Array of embed fields
 */
function splitEmbedField(field: APIEmbedField): APIEmbedField[] {
	const fields: APIEmbedField[] = [];
	const fieldName = field.name?.substring(0, EmbedFieldNameLimit);
	const fieldValues = smartTextSplit(field.value, EmbedFieldValueLimit);
	for (let i = 0; i < fieldValues.length; i++) {
		const fieldValue = fieldValues[i];
		let name = fieldName;
		if (fieldValues.length > 1) {
			const countString = ` *(${i + 1}/${fieldValues.length})*`;
			if (fieldName.length + countString.length > EmbedFieldNameLimit) {
				name = fieldName.substring(0, fieldName.length - countString.length) + countString;
			} else {
				name = fieldName + countString;
			}
		}
		fields.push({
			name: name,
			value: fieldValue,
			inline: field.inline,
		});
	}
	return fields;
}

/**
 * Split one rich embed into several ones if needed (depending on embed limits)
 * @param message Rich embed
 * @returns Array of rich embeds
 */
function splitEmbedMessage(embed: APIEmbed): EmbedBuilder[] {
	const title = embed.title?.substring(0, EmbedTitleLimit) ?? null;
	const descriptions = smartTextSplit(embed.description ?? "", EmbedDescriptionLimit);
	const fields: APIEmbedField[] = [];
	const fieldsArray: APIEmbedField[][] = [];
	for (const field of embed?.fields ?? []) {
		const embedFields = splitEmbedField(field);
		fields.push(...embedFields);
	}
	let fieldsState = fields;
	do {
		fieldsArray.push(fieldsState.slice(0, EmbedNbFieldLimit));
		fieldsState = fieldsState.slice(0, EmbedNbFieldLimit);
	} while (fields.length > EmbedNbFieldLimit && fieldsState.length <= EmbedNbFieldLimit);
	const embeds: EmbedBuilder[] = [];
	// For each description, add a new embed with only description, no field
	for (const description of descriptions) {
		const newEmbed = new EmbedBuilder(embed);
		newEmbed.setTitle(title);
		newEmbed.setDescription(description);
		newEmbed.setFields([]);
		// Split embed if its total size is too high
		if (newEmbed.length > EmbedBuildersLimit) {
			const overflow = newEmbed.length - EmbedBuildersLimit;
			const delta = description.length - overflow;
			const splittedDescription = smartTextSplit(description, delta);
			for (const desc of splittedDescription) {
				const newSplittedEmbed = new EmbedBuilder(newEmbed.toJSON());
				newSplittedEmbed.setDescription(desc);
				embeds.push(newSplittedEmbed);
			}
		} else {
			embeds.push(newEmbed);
		}
	}
	// Add fields to the last embed with description
	const pivotEmbedSizeWithoutFields = embeds[embeds.length - 1].length;
	embeds[embeds.length - 1].setFields(fieldsArray[0]);
	// Split embed if its total size is too high
	if (embeds[embeds.length - 1].length > EmbedBuildersLimit) {
		const delta = EmbedBuildersLimit - pivotEmbedSizeWithoutFields;
		const firstFieldSize = getEmbedFieldsSize([fieldsArray[0][0]]);
		let indexFirstField = 0;
		if (delta < firstFieldSize) {
			embeds[embeds.length - 1].setFields([]);
		} else {
			const newFields = splitEmbedFields(fieldsArray[0], delta);
			embeds[embeds.length - 1].setFields(newFields[0]);
			indexFirstField = newFields[0].length;
		}
		const newFieldsArray = fieldsArray[0].slice(indexFirstField);
		const splittedFields = splitEmbedFields(newFieldsArray, EmbedBuildersLimit);
		for (const splittedField of splittedFields) {
			const newSplittedEmbed = new EmbedBuilder(embeds[embeds.length - 1].toJSON());
			newSplittedEmbed.setDescription(null);
			newSplittedEmbed.setFields(splittedField);
			embeds.push(newSplittedEmbed);
		}
	}
	// For each supplementary fields, add a new embed with no description
	for (let index = 1; index < fieldsArray.length; index++) {
		const element = fieldsArray[index];
		// Split embed if its total size is too high
		const splittedFields = splitEmbedFields(element, EmbedBuildersLimit);
		for (const splittedField of splittedFields) {
			const newSplittedEmbed = new EmbedBuilder(embed);
			newSplittedEmbed.setTitle(title);
			newSplittedEmbed.setDescription(null);
			newSplittedEmbed.setFields(splittedField);
			embeds.push(newSplittedEmbed);
		}
	}
	return embeds;
}

/**
 * Split message that contains only text into several ones if needed (depending on message content limit)
 * @param message Text only message
 * @returns Array of text only messages
 */
function splitTextOnlyMessage(message: string): string[] {
	return smartTextSplit(message, MessageContentLimit);
}

/**
 * Split message in several ones if some parts of the message are too large
 * @param message Discord message with text and/or embeds
 * @returns Array of messages that respects discord message limits
 */
export function splitMessage(message: string | BaseMessageOptions): (string | BaseMessageOptions)[] {
	if (typeof message === "string") {
		return splitTextOnlyMessage(message);
	}
	if (message.content && !message.embeds) {
		const text = message.content ?? "";
		return splitTextOnlyMessage(text);
	}
	if (!message.embeds) {
		return [message];
	}
	let embedsSize = 0;
	let embeds: EmbedBuilder[] = [];
	const embedsResult: EmbedBuilder[][] = [];
	for (const embed of message.embeds) {
		const apiEmbed = Object.hasOwn(embed, "toJSON") ? (embed as JSONEncodable<APIEmbed>).toJSON() : (embed as APIEmbed);
		const splittedEmbed = splitEmbedMessage(apiEmbed);
		const size = splittedEmbed.reduce((previousValue, currentValue) => {
			return previousValue + currentValue.length;
		}, 0);
		embedsSize += size;
		if (embedsSize > EmbedBuildersLimit) {
			embedsResult.push(embeds);
			embeds = [];
			embedsSize = size;
		}
		embeds.push(...splittedEmbed);
	}
	embedsResult.push(embeds);
	return embedsResult.map((item) => ({ embeds: item }));
}

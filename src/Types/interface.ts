/** @format */

import {
	CommandInteraction,
	ChatInputApplicationCommandData,
	Client,
	AutocompleteInteraction,
	Collection,
} from "discord.js";

export interface Event {
	name: string;
	handle: (client: PrefixClient | Client) => void;
}

export interface Command extends ChatInputApplicationCommandData {
	jsonData: Object;
	execute: (client: Client, interaction: CommandInteraction) => any;
}

export interface AutoCompleteCommand extends Command {
	respond: (client: Client, interaction: AutocompleteInteraction) => any;
}

export interface PrefixClient extends Client {
	prefixes: Collection<string, string>;
}

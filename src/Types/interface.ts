/** @format */

import {
	CommandInteraction,
	ChatInputApplicationCommandData,
	Client,
	AutocompleteInteraction,
	Collection,
	User,
} from "discord.js";
import { Infractions } from "../Database/database";

export interface Event {
	name: string;
	handle: (client: PrefixClient) => void;
}

export interface Command extends ChatInputApplicationCommandData {
	jsonData?: Object;
	execute: (client: PrefixClient, interaction: CommandInteraction) => any;
}

export interface AutoCompleteCommand extends Command {
	respond: (client: Client, interaction: AutocompleteInteraction) => any;
}

export interface PrefixClient extends Client {
	prefixes: Collection<string, string>;
}

export interface SubCommandParent extends Command {
	children: SubCommand[];
}

export interface SubCommand extends Command {
	parentName: string;
}

export interface InfractionEmbedOptions {
	message?: boolean;
	customInfraction?: Infractions;
}

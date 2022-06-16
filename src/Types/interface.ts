/** @format */

import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import {
	CommandInteraction,
	ChatInputApplicationCommandData,
	Client,
	AutocompleteInteraction,
	Collection,
	User,
	MessageEmbed,
	Interaction,
} from "discord.js";
import { Infractions } from "../Database/database";

export interface Event {
	name: string;
	handle: (client: PrefixClient<true>) => void;
}

export type BasicCommandTypes = "infraction" | "regular";

export interface Command extends ChatInputApplicationCommandData {
	commandType: BasicCommandTypes;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	execute: (
		client: PrefixClient<true>,
		interaction: CommandInteraction
	) => Promise<any>;
}

export interface AutoCompleteCommand extends Command {
	respond: (
		client: Client,
		interaction: AutocompleteInteraction
	) => Promise<any>;
}

export interface PrefixClient<Ready extends boolean> extends Client<Ready> {
	prefixes: Collection<string, string>;
}

export interface SubCommandParent extends ChatInputApplicationCommandData {
	commandType: BasicCommandTypes;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	children: SubCommand[];
	execute: (
		client: PrefixClient<true>,
		interaction: CommandInteraction
	) => Promise<any>;
}

export interface SubCommand extends ChatInputApplicationCommandData {
	commandType: BasicCommandTypes;
	parentName: string;
	execute: (
		client: PrefixClient<true>,
		interaction: CommandInteraction
	) => Promise<any>;
}

export interface InfractionEmbedOptions {
	message?: boolean;
	customInfraction?: Infractions;
}

type InfractionEventTypes = "infraction" | "moderation" | "serverChange";

export interface InfractionEventOptions {
	embed: void | MessageEmbed;
	interaction: Interaction<"cached">;
	type: InfractionEventTypes;
}
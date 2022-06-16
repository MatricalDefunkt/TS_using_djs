/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import {
	Collection,
	CommandInteraction,
} from "discord.js";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
	SubCommandParent,
} from "../Types/interface";
import { MuteSubCommands } from "./mute/exports";

const subCommands: Collection<string, SubCommand> = new Collection();
MuteSubCommands.forEach((subCommand: SubCommand) => {
	subCommands.set(subCommand.name, subCommand);
});

const data = new SlashCommandBuilder()
	.setName("mute")
	.setDescription("Mutes the given user.")
	.addSubcommand((sc) =>
		sc
			.setName("permanent")
			.setDescription("Mutes a user, permanently.")
			.addUserOption((o) =>
				o.setName("user").setDescription("User to mute").setRequired(true)
			)
			.addIntegerOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the mute (Will appear in Audit Logs)")
					.addChoices(
						{ name: "Custom Reason", value: 0 },
						{ name: "Gen Rule#1", value: 101 },
						{ name: "Gen Rule#2", value: 102 },
						{ name: "Gen Rule#3", value: 103 },
						{ name: "Gen Rule#4", value: 104 },
						{ name: "Gen Rule#5", value: 105 },
						{ name: "Gen Rule#6", value: 106 },
						{ name: "Gen Rule#7", value: 107 },
						{ name: "Gen Rule#8", value: 108 },
						{ name: "Voice Rule#1", value: 201 },
						{ name: "Voice Rule#2", value: 202 },
						{ name: "Voice Rule#3", value: 203 },
						{ name: "Voice Rule#4", value: 204 },
						{ name: "Voice Rule#5", value: 205 },
						{ name: "Voice Rule#6", value: 206 },
						{ name: "Voice Rule#7", value: 207 }
					)
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("custom-reason")
					.setDescription(
						"Please type the custom reason for the mute if you have chosen \"Custom Reason\" under 'Reason'"
					)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("temporary")
			.setDescription("mutes a user, temporarily.")
			.addUserOption((o) =>
				o.setName("user").setDescription("User to mute").setRequired(true)
			)
			.addIntegerOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the mute (Will appear in Audit Logs)")
					.addChoices(
						{ name: "Custom Reason", value: 0 },
						{ name: "Gen Rule#1", value: 101 },
						{ name: "Gen Rule#2", value: 102 },
						{ name: "Gen Rule#3", value: 103 },
						{ name: "Gen Rule#4", value: 104 },
						{ name: "Gen Rule#5", value: 105 },
						{ name: "Gen Rule#6", value: 106 },
						{ name: "Gen Rule#7", value: 107 },
						{ name: "Gen Rule#8", value: 108 },
						{ name: "Voice Rule#1", value: 201 },
						{ name: "Voice Rule#2", value: 202 },
						{ name: "Voice Rule#3", value: 203 },
						{ name: "Voice Rule#4", value: 204 },
						{ name: "Voice Rule#5", value: 205 },
						{ name: "Voice Rule#6", value: 206 },
						{ name: "Voice Rule#7", value: 207 }
					)
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("duration")
					.setDescription("Duration of the mute.")
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("custom-reason")
					.setDescription(
						"Please type the custom reason for the mute if you have chosen \"Custom Reason\" under 'Reason'"
					)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("convert")
			.setDescription("Converts a mute to a temporary mute or vice-versa.")
			.addStringOption((o) =>
				o
					.setName("user-id")
					.setDescription("UserID of the user to be converted.")
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the conversion.")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("undo")
			.setDescription("Unmutes the given user.")
			.addUserOption((o) =>
				o
					.setName("user")
					.setDescription("User to be unmuted.")
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the unmute (Will appear in Audit Logs)")
					.setRequired(true)
			)
	);
const jsonData = data.toJSON();

export class Mute implements SubCommandParent {
	name: string;
	description: string;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	children: SubCommand[];
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "mute";
		this.description = "Gives a user the muted role";
		this.jsonData = jsonData;
		this.children = MuteSubCommands;
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			await interaction.deferReply({ ephemeral: true });

			const subCommand = subCommands.get(interaction.options.getSubcommand());

			if (subCommand) {
				try {
					await subCommand.execute(client, interaction).catch((error: any) => {
						interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP.`,
						});
						console.log(error);
					});
					return;
				} catch (e) {
					await interaction.editReply({
						content: "There was an error. Please contact Matrical ASAP",
					});
					console.error(e);
				}
			} else {
				await interaction.editReply({
					content: `This sub-command doesn't exist as of now. I am working on it! :)`,
				});
			}
			return;
		};
	}
}

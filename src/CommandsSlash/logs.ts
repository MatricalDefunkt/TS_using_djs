/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	Collection,
} from "discord.js";
import { PrefixClient, SubCommandParent, SubCommand } from "../Types/interface";
import { LogsSubCommands } from "./logs/exports";

const subCommands: Collection<string, SubCommand> = new Collection();
LogsSubCommands.forEach((subCommand: SubCommand) => {
	subCommands.set(subCommand.name, subCommand);
});

const data = new SlashCommandBuilder()
	.setName("logs")
	.setDescription("Get logs of a user.")
	.addSubcommand((sc) =>
		sc
			.setName("view")
			.setDescription(
				"Brings the logs of the user with caseID, Mod, User and Type."
			)
			.addUserOption((o) =>
				o
					.setName("target")
					.setDescription("User to get the logs of.")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("view_with_id")
			.setDescription(
				"Brings the logs of the user with caseID, Mod, User and Type, using a user ID"
			)
			.addStringOption((o) =>
				o
					.setName("target")
					.setDescription("UserID to get the logs of.")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("count")
			.setDescription("Brings the counts of infractions, sorted on the type.")
			.addUserOption((o) =>
				o
					.setName("target")
					.setDescription("User to get the logs of.")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("clear")
			.setDescription("Removes a log from the database using the case ID")
			.addStringOption((o) =>
				o
					.setName("caseid")
					.setDescription("Case ID of the log you want to remove")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("set-reason")
			.setDescription(
				"Allows you to set or reset the reason of a case or note using the caseID."
			)
			.addStringOption((o) =>
				o
					.setName("caseid")
					.setDescription("CaseID you want to refer to")
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("reason")
					.setDescription("The new reason you would like to change it to.")
					.setRequired(true)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("get-case")
			.setDescription("Gets the case for you using caseID.")
			.addStringOption((o) =>
				o
					.setName("caseid")
					.setDescription("CaseID you want to refer to")
					.setRequired(true)
			)
	);
const jsonData = data.toJSON();

export const Logs: SubCommandParent = {
	name: "logs",
	description: 'Runs sub commands with the parent "logs"',
	jsonData,
	children: LogsSubCommands,
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		await interaction.deferReply({ ephemeral: true });

		const subCommand = subCommands.get(interaction.options.getSubcommand());

		if (subCommand) {
			try {
				await subCommand.execute(client, interaction);
				return;
			} catch (e: any) {
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
	},
};

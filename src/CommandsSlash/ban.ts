/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	Collection,
} from "discord.js";
import {
	PrefixClient,
	SubCommand,
	SubCommandParent,
} from "src/Types/interface";
import { BanSubCommands } from "./ban/exports";

const subCommands: Collection<string, SubCommand> = new Collection();
BanSubCommands.forEach((subCommand: SubCommand) => {
	subCommands.set(subCommand.name, subCommand);
});

const data = new SlashCommandBuilder()
	.setName("ban")
	.setDescription("Bans the given user.")
	.addSubcommand((sc) =>
		sc
			.setName("permanant")
			.setDescription("Bans a user, permanantly.")
			.addUserOption((o) =>
				o.setName("user").setDescription("User to ban").setRequired(true)
			)
			.addIntegerOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the ban (Will appear in Audit Logs)")
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
			.addIntegerOption((o) =>
				o
					.setName("msg-history")
					.setDescription("Delete the message history for the given time")
					.addChoices(
						{ name: "Don't delete", value: 0 },
						{ name: "1 Day / 24 Hours", value: 1 },
						{ name: "2 Days / 48 Hours", value: 2 },
						{ name: "3 Days / 72 Hours", value: 3 },
						{ name: "4 Days / 96 Hours", value: 4 },
						{ name: "5 Days / 120 Hours", value: 5 },
						{ name: "6 Days / 144 Hours", value: 6 },
						{ name: "7 Days / 168 Hours", value: 7 }
					)
					.setRequired(true)
			)
			.addBooleanOption((o) =>
				o
					.setName("disputable")
					.setDescription("Whether the ban is disputable or not.")
			)
			.addStringOption((o) =>
				o
					.setName("custom-reason")
					.setDescription(
						"Please type the custom reason for the ban if you have chosen \"Custom Reason\" under 'Reason'"
					)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("temporary")
			.setDescription("Bans a user, temporarily.")
			.addUserOption((o) =>
				o.setName("user").setDescription("User to ban").setRequired(true)
			)
			.addIntegerOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the ban (Will appear in Audit Logs)")
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
			.addIntegerOption((o) =>
				o
					.setName("msg-history")
					.setDescription("Delete the message history for the given time")
					.addChoices(
						{ name: "Don't delete", value: 0 },
						{ name: "1 Day / 24 Hours", value: 1 },
						{ name: "2 Days / 48 Hours", value: 2 },
						{ name: "3 Days / 72 Hours", value: 3 },
						{ name: "4 Days / 96 Hours", value: 4 },
						{ name: "5 Days / 120 Hours", value: 5 },
						{ name: "6 Days / 144 Hours", value: 6 },
						{ name: "7 Days / 168 Hours", value: 7 }
					)
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("duration")
					.setDescription(
						"Duration of the ban."
					)
					.setRequired(true)
			)
			.addBooleanOption((o) =>
				o
					.setName("disputable")
					.setDescription("Whether the ban is disputable or not.")
			)
			.addStringOption((o) =>
				o
					.setName("custom-reason")
					.setDescription(
						"Please type the custom reason for the ban if you have chosen \"Custom Reason\" under 'Reason'"
					)
			)
	)
	.addSubcommand((sc) =>
		sc
			.setName("convert")
			.setDescription("Converts a ban to a temporary ban or vice-versa.")
			.addStringOption((o) =>
				o
					.setName("case-id")
					.setDescription("CaseID of the case to be converted.")
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
			.setDescription("Unbans the given user.")
			.setDescription("Unbans the given user.")
			.addStringOption((o) =>
				o
					.setName("user-id")
					.setDescription("UserID of the user to be unbanned.")
					.setRequired(true)
			)
			.addStringOption((o) =>
				o
					.setName("reason")
					.setDescription("Reason for the unban (Will appear in Audit Logs)")
					.setRequired(true)
			)
	);

const jsonData = data.toJSON();

export const Ban: SubCommandParent = {
	name: "ban",
	description: "Bans users lol",
	jsonData,
	children: BanSubCommands,
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
	},
};

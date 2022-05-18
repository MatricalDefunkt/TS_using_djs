/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, PrefixClient } from "../Types/interface";
import { Client, CommandInteraction } from "discord.js";
import { Prefix as PrefixDB } from "../Database/database";

const data = new SlashCommandBuilder()
	.setName("prefix")
	.setDescription("Changes the bot prefix for text commands.")
	.addStringOption((o) =>
		o
			.setName("type")
			.setDescription("Type of the prefix you want to change.")
			.addChoices(
				{ name: "Command", value: "command" },
				{ name: "Tag", value: "tag" }
			)
			.setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("action")
			.setDescription(
				"Whether you would like to get the prefix, or you would like to set the prefix."
			)
			.addChoices({ name: "Get", value: "get" }, { name: "Set", value: "set" })
			.setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("prefix")
			.setDescription("The prefix to set to, if you wish to change it.")
	);
const jsonData = data.toJSON();

export const Prefix: Command = {
	name: "prefix",
	description:
		"Changes the prefix by deleting require cache and re-initializing all imports.",
	jsonData,
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
  ): Promise<any> => {
    

		await interaction.deferReply({ ephemeral: true });

		const prefix = interaction.options.getString("prefix");
		const action = interaction.options.getString("action", true);
		const type = interaction.options.getString("type", true);

		if (action === "get") {
			return interaction.editReply({
				content: `The \`${type}\` prefix for the bot is \`${client.prefixes.get(
					type
				)}\`.`,
			});
		}
		if (action === "set") {
			if (!prefix)
				return interaction.editReply({
					content: "Please provide the prefix to change to!",
				});
			if (prefix.length >= 3)
				return interaction.reply({
					content: `Prefix length can not be more than \`3\``,
				});
			await interaction.editReply({ content: `Changing prefix now...` });

			const [existingCommandPrefix, existingTagPrefix] =
				client.prefixes[Symbol.iterator]();

			if (
				(type == existingCommandPrefix[0] &&
					prefix == existingCommandPrefix[1]) ||
				(type == existingTagPrefix[0] && prefix == existingTagPrefix[1])
			)
				return interaction.editReply({
					content: `The prefix for \`${type}\` was already the same as \`${prefix}\``,
				});

			// const files = fs.readdirSync(path.join(__dirname, "/../commands_chat"));
			// files.forEach((file) => {
			// 	delete require.cache[require.resolve(`../commands_chat/${file}`)];
			// });
			delete require.cache[require.resolve("../Events/messageCreate.ts")];
			try {
				await PrefixDB.update(
					{ prefix: prefix },
					{ where: { type: type } }
				).then(() => {
					client.prefixes.delete(type);
					client.prefixes.set(type, prefix);
				});
				await interaction.editReply({
					content: `The \`${type}\` prefix has been changed to \`${prefix}\`.`,
				});
			} catch (e: any) {
				if (e.name === "SequelizeUniqueConstraintError") {
					return interaction.editReply({
						content: `Prefixes for \`command\` and \`tag\` cannot be the same.`,
					});
				} else {
					console.error(e);
					return interaction.editReply({
						content: `There was an error. Please contact Matrical ASAP.`,
					});
				}
			}
		}
		return;
	},
};

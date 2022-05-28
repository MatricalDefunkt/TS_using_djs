/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	AutocompleteInteraction,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	ApplicationCommandOptionChoiceData,
} from "discord.js";
import fs from "fs";
import path from "path";
import { AutoCompleteCommand } from "../Types/interface";
import config from "../Utils/config.json";

const responses: { name: string; value: string }[] = [];

for (const entry of Object.entries(config)) {
	responses.push(entry[1].response);
}

const data = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Allows an admin to configure the bot.")
	.addStringOption((o) =>
		o
			.setName("config-type")
			.setDescription("What you would like to configure.")
			.setRequired(true)
			.setAutocomplete(true)
	)
	.addStringOption((o) =>
		o
			.setName("config-value")
			.setDescription("The value you would like to set the option to.")
			.setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("reason")
			.setDescription("Reason for the change.")
			.setRequired(true)
	);

const jsonData = data.toJSON();

export const Config: AutoCompleteCommand = {
	name: "config",
	description: "Allows an admin to configure the bot.",
	jsonData,
	execute: async (
		client: Client,
		interaction: CommandInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;
		await interaction.deferReply({ ephemeral: true });
		const option = interaction.options.getString("config-type", true);
		const newValue = interaction.options.getString("config-value", true);
		const reason = interaction.options.getString("reason", true);

		const row = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId("yeschange")
				.setEmoji("✅")
				.setLabel("Yes, change.")
				.setStyle("DANGER"),
			new MessageButton()
				.setCustomId("nocancel")
				.setEmoji("❎")
				.setLabel("No, cancel.")
				.setStyle("SUCCESS"),
		]);
		const disabledRow = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId("yeschange")
				.setEmoji("✅")
				.setLabel("Yes, change.")
				.setStyle("DANGER")
				.setDisabled(true),
			new MessageButton()
				.setCustomId("nocancel")
				.setEmoji("❎")
				.setLabel("No, cancel.")
				.setStyle("SUCCESS")
				.setDisabled(true),
		]);

		const embed = new MessageEmbed()
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL({
					size: 512,
					dynamic: true,
				}),
			})
			.setTitle(
				responses.find((response) => response.value === option)?.name ??
					"undefined"
			)
			.setDescription(
				`${interaction.user.toString()}, are you sure that you want to change ${
					responses.find((response) => response.value === option)?.name
				}'s value to ${newValue}, with the reason:\n${reason}?
				Please make sure that there are absolutely no errors, as this can break the bot entirely.`
			);

		const reply = await interaction.editReply({
			embeds: [embed],
			components: [row],
		});

		reply
			.awaitMessageComponent({ componentType: "BUTTON" })
			.then(async (button) => {
				if (!button.isButton()) return;
				await button.deferUpdate();
				await button.editReply({ components: [disabledRow] });

				const configBuffer = fs.readFileSync(
					path.join(__dirname, "../Utils/config.json")
				);
				const configJSON = JSON.parse(configBuffer.toString());
				await button.editReply({
					content: `\`\`\`json${configJSON}\`\`\``,
				});
				console.log(configJSON);
			});

		return;
	},
	respond: async (
		client: Client,
		interaction: AutocompleteInteraction
	): Promise<any> => {
		const typing = interaction.options.getFocused();

		if (!typing) {
			interaction.respond(responses);
		} else {
			const foundResponses = responses.filter(
				(item) =>
					item.name.toLowerCase().includes(typing.toString().toLowerCase()) ||
					item.value.toLowerCase().includes(typing.toString().toLowerCase())
			);
			interaction.respond(foundResponses);
		}
	},
};

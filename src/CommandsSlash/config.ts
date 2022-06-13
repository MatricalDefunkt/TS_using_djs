/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	AutocompleteInteraction,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import fs from "fs";
import path from "path";
import { AutoCompleteCommand } from "../Types/interface";
import config from "../Utils/config.json";

const responses: { name: string; value: string }[] = [];

for (const entry of config) {
	responses.push(entry.response);
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

		if (option === `missingPermissions`)
			return interaction.editReply({ content: `Missing permissions.` });

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
				await button.deferUpdate();
				await button.editReply({ components: [disabledRow] });

				if (button.customId === "yeschange") {
					console.log(config);
					const changeConfig = config.find(
						(config) => config.response.value === option
					);
					const changeConfigIndex = config.findIndex(
						(config) => config.response.value === option
					);

					if (changeConfig) {
						if (changeConfig.type === "role") {
							try {
								const role = await interaction.guild.roles.fetch(newValue, {
									force: false,
									cache: true,
								});
								if (!role)
									return button.editReply({
										content: `Given value is not a role ID`,
										embeds: [],
									});
								changeConfig.value = newValue;
								config[changeConfigIndex] = changeConfig;
								console.log(config);
							} catch (error: any) {
								if (error.code === 10003 || error.code === 50035)
									return button.editReply({
										content: `Given value is not a role ID`,
										embeds: [],
									});
								else console.error(error);
							}
						} else if (changeConfig.type === "channel") {
							try {
								const channel = await interaction.guild.channels.fetch(
									newValue,
									{
										force: false,
										cache: true,
									}
								);
								if (!channel)
									return button.editReply({
										content: `Given value is not a channel ID`,
										embeds: [],
									});
								changeConfig.value = newValue;
								config[changeConfigIndex] = changeConfig;
								console.log(config);
							} catch (error: any) {
								if (error.code === 10003 || error.code === 50035)
									return button.editReply({
										content: `Given value is not a channel ID`,
										embeds: [],
									});
								else console.error(error);
							}
						}
					}
					await button.editReply({
						content: JSON.stringify(config),
					});

					fs.writeFileSync(
						path.join(__dirname, "../Utils/config.json"),
						JSON.stringify(config)
					);

					delete require.cache[require.resolve("../Events/messageCreate")];
					delete require.cache[
						require.resolve("../Events/messageCreateAssistant")
					];

					await button.editReply({
						content: `Completed the change.`,
						embeds: [],
					});
				} else if (button.customId === "nocancel") {
					button.editReply({ content: `Cancelled the change.`, embeds: [] });
				}
			});

		return;
	},
	respond: async (
		client: Client,
		interaction: AutocompleteInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;

		if (!interaction.member.permissions.has("ADMINISTRATOR"))
			return interaction.respond([
				{ name: `Missing permissions.`, value: `missingPermissions` },
			]);

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

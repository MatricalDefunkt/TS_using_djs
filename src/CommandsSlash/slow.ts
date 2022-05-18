/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	TextChannel,
} from "discord.js";
import { Command } from "../Types/interface";

const data = new SlashCommandBuilder()
	.setName("slow")
	.setDescription("Sets a channel's slow-mode.")
	.addChannelOption((o) =>
		o
			.setName("channel")
			.setDescription("The channel you would like slowmode in.")
			.setRequired(true)
	)
	.addNumberOption((o) =>
		o
			.setName("time")
			.setDescription("Time to set the delay to:")
			.setRequired(true)
			.addChoices(
				{ name: "Remove", value: 0 },
				{ name: "2 Seconds", value: 2 },
				{ name: "3 Seconds", value: 3 },
				{ name: "4 Seconds", value: 4 },
				{ name: "5 Seconds", value: 5 },
				{ name: "10 Seconds", value: 10 },
				{ name: "15 Seconds", value: 15 }
			)
	)
	.addStringOption((o) =>
		o.setName("reason").setDescription("Reason for slow-mode")
	);

const jsonData = data.toJSON();

export const Slow: Command = {
	name: "slow",
	description: "Sets a channels slowmode",
	jsonData,
	execute: async (
		client: Client,
		interaction: CommandInteraction
	): Promise<any> => {
		await interaction.deferReply({ ephemeral: true });

		const _channel = interaction.options.getChannel("channel", true);
		const time = interaction.options.getNumber("time", true);
		const _reason = interaction.options.getString("reason");

		const channel = await client.channels.fetch(_channel.id, {
			force: false,
			cache: true,
		});

		if (!channel)
			return interaction.editReply({
				content: `Channel was not found. This is an error. Please contact Matrical ASAP`,
			});

		let reason: string;
		if (!_reason) {
			reason = `${interaction.user.tag} | None provided.`;
		} else {
			reason = `${interaction.user.tag} | ${_reason}`;
		}

		if (channel.isText()) {
			if (time === 0) {
				if (channel.type == "GUILD_TEXT") {
					channel
						.setRateLimitPerUser(time, reason)
						.then((channel) => {
							return interaction.editReply({
								content: `Successfully removed slow-mode for ${channel} with reason:\n${reason}`,
							});
						})
						.catch((err: any) => {
							console.error(err);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						});
				} else {
					interaction.editReply({
						content: `Channel must be of type "text".`,
					});
				}
			} else {
				if (channel.type == "GUILD_TEXT") {
					channel
						.setRateLimitPerUser(time, reason)
						.then((channel) => {
							return interaction.editReply({
								content: `Successfully set slow-mode of \`${time}s\` for ${channel} with reason:\n${reason}`,
							});
						})
						.catch((err) => {
							console.error(err);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						});
				} else {
					interaction.editReply({
						content: `Channel must be of type "text".`,
					});
				}
			}
		} else {
			interaction.editReply({ content: `Channel must be of type "text"` });
		}
	},
};

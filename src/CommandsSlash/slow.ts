/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Client, CommandInteraction } from "discord.js";
import { BasicCommandTypes, Command, PrefixClient } from "../Types/interface";
import {
	ChannelType,
	RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

const data = new SlashCommandBuilder()
	.setName("slow")
	.setDescription("Sets a channel's slow-mode.")
	.addChannelOption((o) =>
		o
			.setName("channel")
			.setDescription("The channel you would like slowmode in.")
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText)
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

export class Slow implements Command {
	name: string;
	description: string;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	commandType: BasicCommandTypes;
	execute: (
		client: PrefixClient<true>,
		interaction: CommandInteraction
	) => Promise<any>;

	constructor() {
		this.name = "slow";
		this.description = "Sets a channel's slow-mode";
		this.jsonData = jsonData;
		this.commandType = "regular";
		this.execute = async (
			client: PrefixClient<true>,
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
		};
	}
}

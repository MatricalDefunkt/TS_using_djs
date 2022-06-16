/** @format */

import { Interaction, MessageEmbed } from "discord.js";
import { InfractionLogger } from "../Utils/infractionLogger";
import {
	Event,
	InfractionEventOptions,
	PrefixClient,
} from "../Types/interface";
import configs from "../Utils/config.json";

const punishmentLogId = configs.find(
	(config) => config.response.value === "infractionLogId"
)?.value;

const moderationLogId = configs.find(
	(config) => config.response.value === "modLogId"
)?.value;

const serverChangeLogId = configs.find(
	(config) => config.response.value === "serverLogId"
)?.value;

export const infractionCreate: Event = {
	name: "loggerCreate",
	handle: async (client: PrefixClient<true>) => {
		client.on(
			"loggerCreate",
			async ({
				embed,
				interaction,
				type,
			}: InfractionEventOptions): Promise<any> => {
				if (interaction.isCommand()) {
					if (type === "infraction") {
						if (!punishmentLogId)
							return interaction.followUp({
								content: `Punishment Log channel has not been set. Please use /config to set it.`,
								ephemeral: true,
							});
						await client.channels
							.fetch(punishmentLogId, {
								cache: true,
								force: false,
							})
							.then((logChannel): any => {
								if (logChannel?.isText() && logChannel.type === "GUILD_TEXT") {
									if (!embed) {
										const embed = new MessageEmbed();
										embed.setTitle("Error Embed");
										embed.setColor("RED");
										embed.setDescription(
											`There was an error, which resulted in this basic embed being created.\n**Command Name** - ${
												interaction.commandName
											}\n**Moderator** - ${
												interaction.user.id
											}\nTime - <t:${Math.trunc(
												interaction.createdTimestamp / 1000
											)}:F>\n${
												interaction.options.data[0].type === "SUB_COMMAND"
													? `**SubCommand** - ${interaction.options.getSubcommand()}`
													: ``
											}`
										);
										embed.addField(
											`Debug Data`,
											`\`${JSON.stringify(interaction.options.data)
												.trim()
												.slice(0, 1021)}\``
										);
										if (
											JSON.stringify(interaction.options.data).length > 1022
										) {
											embed.addField(
												`Debug Data 1`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(1022, 2043)}\``
											);
										}
										if (
											JSON.stringify(interaction.options.data).length > 2044
										) {
											embed.addField(
												`Debug Data 2`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(2044, 3065)}\``
											);
										}

										return new InfractionLogger(logChannel, embed);
									}
									return new InfractionLogger(logChannel, embed);
								} else {
									return interaction.followUp({
										content:
											"The punishment log channel was not found. Please check permissions, and the channel ID and contact Matrical.",
										ephemeral: true,
									});
								}
							})
							.catch((e) => {
								interaction.followUp({
									content:
										"There was an error getting the punishment log channel. Please check permissions, and the channel ID and contact Matrical.",
									ephemeral: true,
								});
								return console.error(e);
							});
					} else if (type === "moderation") {
						if (!moderationLogId)
							return interaction.followUp({
								content: `Moderation Log channel has not been set. Please use /config to set it.`,
								ephemeral: true,
							});
						await client.channels
							.fetch(moderationLogId, {
								cache: true,
								force: false,
							})
							.then((logChannel): any => {
								if (logChannel?.isText() && logChannel.type === "GUILD_TEXT") {
									if (!embed) {
										const embed = new MessageEmbed();
										embed.setTitle("Error Embed");
										embed.setColor("RED");
										embed.setDescription(
											`There was an error, which resulted in this basic embed being created.\n**Command Name** - ${
												interaction.commandName
											}\n**Moderator** - ${
												interaction.user.id
											}\nTime - <t:${Math.trunc(
												interaction.createdTimestamp / 1000
											)}:F>\n${
												interaction.options.data[0].type === "SUB_COMMAND"
													? `**SubCommand** - ${interaction.options.getSubcommand()}`
													: ``
											}`
										);
										embed.addField(
											`Debug Data`,
											`\`${JSON.stringify(interaction.options.data)
												.trim()
												.slice(0, 1021)}\``
										);
										if (
											JSON.stringify(interaction.options.data).length > 1022
										) {
											embed.addField(
												`Debug Data 1`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(1022, 2043)}\``
											);
										}
										if (
											JSON.stringify(interaction.options.data).length > 2044
										) {
											embed.addField(
												`Debug Data 2`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(2044, 3065)}\``
											);
										}

										return new InfractionLogger(logChannel, embed);
									}
									return new InfractionLogger(logChannel, embed);
								} else {
									return interaction.followUp({
										content:
											"The moderation log channel was not found. Please check permissions, and the channel ID and contact Matrical.",
										ephemeral: true,
									});
								}
							})
							.catch((e) => {
								interaction.followUp({
									content:
										"There was an error getting the moderation log channel. Please check permissions, and the channel ID and contact Matrical.",
									ephemeral: true,
								});
								return console.error(e);
							});
					} else if (type === "serverChange") {
						if (!serverChangeLogId)
							return interaction.followUp({
								content: `Server changes log channel has not been set. Please use /config to set it.`,
								ephemeral: true,
							});
						await client.channels
							.fetch(serverChangeLogId, {
								cache: true,
								force: false,
							})
							.then((logChannel): any => {
								if (logChannel?.isText() && logChannel.type === "GUILD_TEXT") {
									if (!embed) {
										const embed = new MessageEmbed();
										embed.setTitle("Error Embed");
										embed.setColor("RED");
										embed.setDescription(
											`There was an error, which resulted in this basic embed being created.\n**Command Name** - ${
												interaction.commandName
											}\n**Moderator** - ${
												interaction.user.id
											}\nTime - <t:${Math.trunc(
												interaction.createdTimestamp / 1000
											)}:F>\n${
												interaction.options.data[0].type === "SUB_COMMAND"
													? `**SubCommand** - ${interaction.options.getSubcommand()}`
													: ``
											}`
										);
										embed.addField(
											`Debug Data`,
											`\`${JSON.stringify(interaction.options.data)
												.trim()
												.slice(0, 1021)}\``
										);
										if (
											JSON.stringify(interaction.options.data).length > 1022
										) {
											embed.addField(
												`Debug Data 1`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(1022, 2043)}\``
											);
										}
										if (
											JSON.stringify(interaction.options.data).length > 2044
										) {
											embed.addField(
												`Debug Data 2`,
												`\`${JSON.stringify(interaction.options.data)
													.trim()
													.slice(2044, 3065)}\``
											);
										}

										return new InfractionLogger(logChannel, embed);
									}
									return new InfractionLogger(logChannel, embed);
								} else {
									return interaction.followUp({
										content:
											"The server changes log channel was not found. Please check permissions, and the channel ID and contact Matrical.",
										ephemeral: true,
									});
								}
							})
							.catch((e) => {
								interaction.followUp({
									content:
										"There was an error getting the server changes log channel. Please check permissions, and the channel ID and contact Matrical.",
									ephemeral: true,
								});
								return console.error(e);
							});
					} else {
						throw new Error(
							`InfractionCreate.type is incorrect.\nExpected: "infraction" | "moderation" | "serverChange"\nRecieved: "${type}"\nInteraction name: ${
								interaction.commandName
							}${
								interaction.options.data[0].type === "SUB_COMMAND"
									? `Sub Command: ${interaction.options.getSubcommand()}`
									: ``
							}`
						);
					}
				}
			}
		);
	},
};

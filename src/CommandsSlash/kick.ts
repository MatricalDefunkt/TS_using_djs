/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, CommandInteraction, Client } from "discord.js";
import { Infractions } from "../Database/database";
import { Command, PrefixClient } from "../Types/interface";
import { Infraction } from "../Utils/Infraction";
import { rules } from "../Utils/rules.json";

const data = new SlashCommandBuilder()
	.setName("kick")
	.setDescription("Kicks the given user.")
	.addUserOption((o) =>
		o.setName("user").setDescription("User to kick").setRequired(true)
	)
	.addIntegerOption((o) =>
		o
			.setName("reason")
			.setDescription("Reason for the kick (Will appear in Audit Logs)")
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
				"Please type the custom reason for the kick if you have chosen \"Custom Reason\" under 'Reason'"
			)
	);

const jsonData = data.toJSON();

export const Kick: Command = {
	name: "kick",
	description: "Kicks from guild, adding same to DB.",
	jsonData,
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;
		if (!client.user) return;
		await interaction.deferReply({ ephemeral: true });

		const kickee = interaction.options.getMember("user", true);
		let _reason = interaction.options.getInteger("reason", true);
		const customReason = interaction.options.getString("custom-reason");

		if (kickee.kickable == false) {
			return interaction.editReply({
				content: `I cannot kick ${kickee}. They're too powerful 🤯!!`,
			});
		} else if (interaction.member === kickee) {
			return interaction.editReply({
				content: `Okay, you have been kicked. Now move on.`,
			});
		}

		let reason: { id: number; reason: string; rule: string };

		const foundRule = rules.find((rule) => rule.id == _reason);

		if (_reason === 0) {
			reason = {
				id: 0,
				reason: customReason ? customReason : "None provided.",
				rule: customReason ? customReason : "None provided.",
			};
		} else {
			reason = foundRule
				? foundRule
				: { id: 404, rule: "Not found.", reason: "Not found." };
		}

		if (reason.id === 404) {
			console.log(
				"Rule with id" +
					_reason +
					"was not found. Please check rules.json asap."
			);
			return interaction.editReply({
				content: `There was an error. Please contact Matrical ASAP.`,
			});
		}

		try {
			const dmChannel = await kickee.createDM(true);
			dmChannel
				.send({
					content: `Message from Practice Your Language:`,
					embeds: [
						new MessageEmbed()
							.setAuthor({
								name: client.user.tag,
								iconURL: client.user.displayAvatarURL({ size: 512 }),
							})
							.setColor("RED")
							.setDescription("A message from PYL staff:")
							.addField(
								"Message:",
								"You have been kicked from PYL for breaking (a) server rule(s)"
							)
							.addField("Rule:", reason.rule),
					],
				})
				.then(() => {
					interaction.editReply({
						content: `${kickee} has recieved the kick message.\nKicking now...`,
					});
					kickee
						.kick(`${interaction.user.tag} || ${reason.reason}`)
						.then(async () => {
							await interaction.editReply({
								content: `${kickee} has been kicked.`,
							});
							const infraction = new Infraction();
							await infraction.addInfraction({
								modID: interaction.user.id,
								target: kickee.user.id,
								reason: reason.reason,
								type: "Kick",
							});
							if (infraction instanceof Error || !infraction.latestInfraction)
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});

							const embed = await infraction.getInfractionEmbed();
							if (!embed) {
								console.log(
									"Could not make an embed with case ID. Please check."
								);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP`,
								});
							}
							if (embed instanceof Error) {
								console.error(embed);
								interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}
							const isError = (x: any): x is Error => {
								if (x instanceof Error) return true;
								return false;
							};
							if (isError(embed)) {
								console.error(embed);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}
							if (!embed || !client.user) {
								console.log(`Could not create embed.`);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}
							embed
								.setAuthor({
									name: client.user.tag,
									iconURL: client.user.displayAvatarURL(),
								})
								.setColor("YELLOW")
								.setFooter({
									iconURL: interaction.user.displayAvatarURL(),
									text: interaction.user.tag,
								})
								.setTimestamp();
							await interaction.editReply({ embeds: [embed] });
						})
						.catch((rejectedReason) => {
							interaction.editReply({
								content: `Something went wrong. Please contact Matrical ASAP.`,
							});
							console.log(rejectedReason);
						});
				});
		} catch (e: any) {
			if (e.code === 50007) {
				await interaction.editReply({
					content: `Cannot send messages to ${kickee}\nKicking now...`,
				});
				await kickee
					.kick(reason.reason)
					.then(async () => {
						await interaction.editReply({
							content: `${kickee} has been kicked.`,
						});

						const infraction = new Infraction();
						await infraction.addInfraction({
							modID: interaction.user.id,
							target: kickee.user.id,
							reason: reason.reason,
							type: "Kick",
						});
						if (infraction instanceof Error || !infraction.latestInfraction)
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});

						const embed = await infraction.getInfractionEmbed();
						if (!embed) {
							console.log(
								"Could not make an embed with case ID. Please check."
							);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP`,
							});
						}
						if (embed instanceof Error) {
							console.error(embed);
							interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						}
						const isError = (x: any): x is Error => {
							if (x instanceof Error) return true;
							return false;
						};
						if (isError(embed)) {
							console.error(embed);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						}

						if (!embed || !client.user) {
							console.log(`Could not create embed.`);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						}
						embed
							.setAuthor({
								name: client.user.tag,
								iconURL: client.user.displayAvatarURL(),
							})
							.setColor("YELLOW")
							.setFooter({
								iconURL: interaction.user.displayAvatarURL(),
								text: interaction.user.tag,
							})
							.setTimestamp();
						await interaction.editReply({ embeds: [embed] });
					})
					.catch((rejectedReason) => {
						interaction.editReply({
							content: `Something went wrong. Please contact Matrical ASAP.`,
						});
						console.log(rejectedReason);
					});
			} else {
				console.error(e);
				return interaction.editReply({
					content: `There was an error. Please contact Matrical ASAP.`,
				});
			}
		}
	},
};

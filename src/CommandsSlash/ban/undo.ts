/** @format */

import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { Infraction } from "../../Utils/Infraction";
import { Infractions } from "../../Database/database";

export class BanUndo implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "undo";
		this.description = "Unbans a user, adding it to the DB.";
		this.parentName = "ban";
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		) => {
			if (!interaction.inCachedGuild()) return;
			const unbanId = interaction.options.getString("user-id", true);
			const reason = interaction.options.getString("reason", true);
			if (unbanId.length != 18)
				return interaction.editReply({
					content: `Please enter a valid user ID`,
				});

			const oldTempBan = (
				await Infractions.findAll({
					where: { targetID: unbanId, type: "TempBan" },
				})
			)[0];

			if (oldTempBan) {
				const row = new MessageActionRow().addComponents([
					new MessageButton()
						.setCustomId("unban")
						.setEmoji("✅")
						.setLabel("Yes, unban.")
						.setStyle("DANGER"),
					new MessageButton()
						.setCustomId("nocancel")
						.setEmoji("❎")
						.setLabel("No, cancel.")
						.setStyle("SUCCESS"),
				]);
				const disabledRow = new MessageActionRow().addComponents([
					new MessageButton()
						.setCustomId("unban")
						.setEmoji("✅")
						.setLabel("Yes, unban.")
						.setStyle("DANGER")
						.setDisabled(true),
					new MessageButton()
						.setCustomId("nocancel")
						.setEmoji("❎")
						.setLabel("No, cancel.")
						.setStyle("SUCCESS")
						.setDisabled(true),
				]);

				const filter = (button: any) => button.user.id === interaction.user.id;
				const reply = await interaction.editReply({
					content: `There exists a temp-ban for <@${unbanId}>, which ends <t:${oldTempBan.getDataValue(
						"duration"
					)}:R>. Do you still want to unban?`,
					components: [row],
				});
				reply
					.awaitMessageComponent({ filter, componentType: "BUTTON" })
					.then(async (button) => {
						if (!button.isButton()) return;
						if (button.customId === "unban") {
							await button.deferUpdate();

							interaction.guild.bans
								.fetch(unbanId)
								.then((unbanUser) => {
									interaction.editReply({ content: `Unbanning <@${unbanId}>` });
									interaction.guild.bans
										.remove(unbanId, `${interaction.user.tag} || ${reason}`)
										.then(async (unbannedUser) => {
											interaction.editReply({
												content: `Unbanned ${unbannedUser}.`,
											});
											const infraction = new Infraction();
											await infraction.addInfraction({
												modID: interaction.user.id,
												target: unbanUser.user.id,
												reason,
												type: "UnBan",
											});

											const embed = infraction.getInfractionEmbed();

											if (!embed) {
												console.log("Could not create embed");
												return button.editReply({
													content: `There was an error. Please contact Matrical ASAP.`,
													components: [disabledRow],
												});
											}
											client.emit("loggerCreate", {
												embed,
												interaction,
												type: "infraction",
											});
											button.editReply({
												content: `Unbanned ${unbanUser}.`,
												embeds: [embed],
												components: [disabledRow],
											});
											if (infraction.latestInfraction instanceof Infractions) {
												const latestInfraction = infraction.latestInfraction;
												latestInfraction.setDataValue("duration", "Completed");
												await latestInfraction.save();
											}
											return;
										})
										.catch((err) => {
											console.error(err);
											interaction.editReply({
												content: `There was an error, please contact Matrical ASAP.`,
											});
										});
								})
								.catch((err) => {
									if (err.code === 10026)
										return interaction.editReply({
											content: `<@${unbanId}> has not been banned in the first place.`,
										});
									interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
									console.error(err);
								});
						} else if (button.customId === "nocancel") {
							return button.update({
								content: `Cancelled.`,
								components: [disabledRow],
							});
						}
					});
			} else {
				interaction.guild.bans
					.fetch(unbanId)
					.then((unbanUser) => {
						interaction.editReply({ content: `Unbanning <@${unbanId}>` });
						interaction.guild.bans
							.remove(unbanId, `${interaction.user.tag} || ${reason}`)
							.then(async (unbannedUser) => {
								interaction.editReply({ content: `Unbanned ${unbannedUser}.` });
								const infraction = new Infraction();
								await infraction.addInfraction({
									modID: interaction.user.id,
									target: unbanUser.user.id,
									reason,
									type: "UnBan",
								});
								const embed = infraction.getInfractionEmbed({
									message: true,
								});
								if (!embed) {
									console.log("Could not make an embed.");
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP`,
									});
								}
								client.emit("loggerCreate", {
									embed,
									interaction,
									type: "infraction",
								});
								await interaction.editReply({ embeds: [embed] });
								return;
							})
							.catch((err) => {
								console.error(err);
								interaction.editReply({
									content: `There was an error, please contact Matrical ASAP.`,
								});
							});
					})
					.catch((err) => {
						if (err.code === 10026)
							return interaction.editReply({
								content: `<@${unbanId}> has not been banned in the first place.`,
								components: [],
							});
						interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP.`,
							components: [],
						});
						console.error(err);
					});
			}
			return;
		};
	}
}

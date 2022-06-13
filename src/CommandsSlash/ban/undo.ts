/** @format */

import { PrefixClient, SubCommand } from "src/Types/interface";
import {
	ButtonInteraction,
	Client,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from "discord.js";
import { Infraction } from "../../Utils/Infraction";
import { Infractions } from "../../Database/database";
import { Op } from "sequelize";

export const BanUndo: SubCommand = {
	name: "undo",
	description: "Unbans a user, adding it to the DB.",
	parentName: "ban",
	execute: async (client: PrefixClient, interaction: CommandInteraction) => {
		if (!interaction.inCachedGuild()) return;
		const unbanId = interaction.options.getString("user-id", true);
		const reason = interaction.options.getString("reason", true);
		if (unbanId.length != 18)
			return interaction.editReply({
				content: `Please enter a valid user ID`,
			});

		const oldTempBan = await Infractions.findOne({
			where: { targetID: unbanId, duration: { [Op.ne]: `Completed` } },
		});

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

										if (!client.user) return;

										const embed = new MessageEmbed()
											.setAuthor({
												name: client.user.tag,
												iconURL: client.user.displayAvatarURL(),
											})
											.setFooter({
												iconURL: interaction.user.displayAvatarURL(),
												text: interaction.user.tag,
											})
											.setTimestamp();
										button.update({
											content: `Unbanned ${unbanUser}.`,
											embeds: [embed],
											components: [disabledRow],
										});
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
							if (!client.user) return;
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
						});
					interaction.editReply({
						content: `There was an error. Please contact Matrical ASAP.`,
					});
					console.error(err);
				});
		}
		return;
	},
};

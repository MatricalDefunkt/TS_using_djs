/** @format */

import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { Op } from "sequelize";
import { Infractions } from "../../Database/database";
import { PrefixClient, SubCommand } from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
import configs from "../../Utils/config.json";

export const MuteUndo: SubCommand = {
	name: "undo",
	description: "Unmutes someone",
	parentName: "mute",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;

		const muteRoleId = configs.find(
			(config) => config.response.value === "muteRoleId"
		)?.value;

		if (!muteRoleId)
			return interaction.editReply({
				content: `Muted role has not been set. Please set it using /config.`,
			});

		const member = interaction.options.getMember("user", true);
		const reason = interaction.options.getString("reason", true);

		if (member.roles.cache.has(muteRoleId)) {
			const foundTempMutes = await Infractions.findAll({
				where: { type: "TempMute", targetID: member.id },
			});
			if (foundTempMutes[foundTempMutes.length - 1].type === "TempMute") {
				const tempMute = foundTempMutes[foundTempMutes.length - 1];

				const row = new MessageActionRow().addComponents([
					new MessageButton()
						.setCustomId("dountempmute")
						.setLabel("Yes, remove.")
						.setEmoji("✅")
						.setStyle("DANGER"),
					new MessageButton()
						.setCustomId("canceluntempmute")
						.setLabel("No, cancel.")
						.setEmoji("❎")
						.setStyle("SUCCESS"),
				]);

				const reply = await interaction.editReply({
					content: `The user already has a temp mute which will end <t:${Math.trunc(
						parseInt(tempMute.duration) / 1000
					)}:R>. Do you still wish to remove their mute? You have 5 minutes to decide.`,
					components: [row],
				});

				reply
					.awaitMessageComponent({ componentType: "BUTTON", time: 300_000 })
					.then(async (button) => {
						if (button.customId === "dountempmute") {
							member.roles
								.remove(muteRoleId)
								.then(async (member) => {
									const infraction = new Infraction();
									await infraction.addInfraction({
										modID: interaction.user.id,
										target: member.id,
										reason,
										type: "UnMute",
									});

									const embed = infraction.getInfractionEmbed();

									if (!embed) {
										console.error("Could not create embed.");
										return interaction.editReply({
											content: `There was an error. Please contact Matrical ASAP.`,
										});
									}

									return interaction.editReply({
										content: `${member} has been unmuted!`,
										embeds: [embed],
										components: [],
									});
								})
								.catch((err) => {
									console.error(err);
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
								});
						} else if (button.customId === "canceluntempmute") {
							return interaction.editReply({
								content: `Cancelled!`,
								components: [],
							});
						}
					})
					.catch((err) => {
						return interaction.editReply({
							content: `Cancelled. You did not click the buttons on time.`,
						});
					});
			}
		} else {
			interaction.editReply({
				content: `Member has not been muted, or does not have the muted role.`,
			});
		}
	},
};

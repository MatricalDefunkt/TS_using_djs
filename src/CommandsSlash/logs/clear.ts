/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import { PrefixClient, SubCommand } from "../../Types/interface";
import { Infractions } from "../../Database/database";

export const LogsClear: SubCommand = {
	name: "clear",
	description: "Clears the database entry using caseID",
	jsonData: {},
	parentName: "logs",
	execute: async (client: PrefixClient, interaction: CommandInteraction) => {
		const caseID = interaction.options.getString("caseid", true);

		const caseToRemove = await Infractions.findOne({
			where: { caseId: caseID },
		});

		if (!caseToRemove)
			return interaction.editReply({
				content: `Case with the ID \`${caseID}\` was not found.`,
			});

		const caseId = caseToRemove.getDataValue("caseID");
		const type = caseToRemove.getDataValue("type");
		const target = `<@${caseToRemove.getDataValue("targetID")}>`;
		const mod = `<@${caseToRemove.getDataValue("modID")}>`;
		const reason = caseToRemove.getDataValue("reason");
		const time = `<t:${Math.trunc(
			Date.parse(caseToRemove.getDataValue("createdAt")) / 1000
		)}:F>`;
		const duration =
			caseToRemove.getDataValue("duration") === "Completed"
				? `Completed.`
				: `<t:${caseToRemove.getDataValue("duration")}:F>`;

		const embed = new MessageEmbed().setDescription(
			`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
				type == "Note" ? `**Note**` : `**Reason**`
			} - ${reason}\n**Time** - ${time}${
				duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
			}`
		);
		embed.setColor(type === "Ban" ? "RED" : "YELLOW");

		if (!embed)
			return interaction.editReply({
				content: `There was an error. Please check case ID.`,
			});

		await caseToRemove.destroy();

		if (client.user) {
			embed
				.setAuthor({
					name: client.user.tag,
					iconURL: client.user?.displayAvatarURL(),
				})
				.setColor("YELLOW");
			await interaction.editReply({
				content: `Cleared case with ID \`${caseID}\` for <@${caseToRemove.getDataValue(
					"targetID"
				)}>`,
				embeds: [embed],
			});
		} else {
			embed
				.setAuthor({
					name: "PYL Bot#9640",
					iconURL:
						"https://cdn.discordapp.com/avatars/954655539546173470/cbead6c4dcc60a58d530f8eaf90de5e6.webp",
				})
				.setColor("YELLOW");
			await interaction.editReply({
				content: `Cleared case with ID \`${caseID}\` for ${caseToRemove.getDataValue(
					"targetID"
				)}>`,
				embeds: [embed],
			});
		}
		return;
	},
};

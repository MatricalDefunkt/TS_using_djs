/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import { PrefixClient, SubCommand } from "src/Types/interface";
import { Infractions } from "../../Database/database";

export const LogsGet: SubCommand = {
	name: "get-case",
	description: "Gets an infraction using caseID and displays it.",
	jsonData: {},
	parentName: "logs",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		const caseID = interaction.options.getString("caseid", true);

		const infraction = await Infractions.findByPk(caseID);

		if (!infraction)
			return interaction.editReply({
				content: `Infraction with the caseID of \`${caseID}\` does not exist.`,
			});

		const embed = new MessageEmbed();

		const caseId = infraction.getDataValue("caseID");
		const type = infraction.getDataValue("type");
		const target = `<@${infraction.getDataValue("targetID")}>`;
		const mod = `<@${infraction.getDataValue("modID")}>`;
		const reason = infraction.getDataValue("reason");
		const time = `<t:${Math.trunc(
			Date.parse(infraction.getDataValue("createdAt")) / 1000
		)}:F>`;
		const duration =
			infraction.getDataValue("duration") === "Completed"
				? `Completed.`
				: `<t:${infraction.getDataValue("duration")}:F>`;

		const description = `**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
			type == "Note" ? `**Note**` : `**Reason**`
		} - ${reason}\n**Time** - ${time}${
			duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
		}`;
		embed.setDescription(description);
		embed.setColor(type === "Ban" ? "RED" : "YELLOW");

		await interaction.editReply({
			content: `Found an infraction with caseID \`${caseID}\``,
			embeds: [embed],
		});

		return;
	},
};

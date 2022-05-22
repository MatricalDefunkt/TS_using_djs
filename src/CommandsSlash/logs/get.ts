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

		const embed = await Infractions.getInfractionEmbed(caseID);

		if (!embed)
			return interaction.editReply({
				content: `There was an error. Please check the case ID.`,
			});

		await interaction.editReply({
			content: `Found an infraction with caseID \`${caseID}\``,
			embeds: [embed],
		});

		return;
	},
};

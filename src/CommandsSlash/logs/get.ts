/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import { PrefixClient, SubCommand } from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
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

		const foundInfraction = await Infractions.findByPk(caseID);
		const infraction = new Infraction();

		if (!foundInfraction)
			return interaction.editReply({
				content: `Infraction with the caseID of \`${caseID}\` does not exist.`,
			});

		const embed = infraction.getInfractionEmbed({
			customInfraction: foundInfraction,
		});
		if (!embed) {
			console.log("Could not make an embed with case ID. Please check.");
			return interaction.editReply({
				content: `There was an error. Please contact Matrical ASAP`,
			});
		}
		if (!client.user) return;
		await interaction.editReply({
			content: `Found an infraction with caseID \`${caseID}\``,
			embeds: [embed],
		});

		return;
	},
};

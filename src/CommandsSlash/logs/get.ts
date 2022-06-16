/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
import { Infractions } from "../../Database/database";

export class LogsGet implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "get-case";
		this.description = "Gets an infraction using caseID and displays it.";
		this.parentName = "logs";
		this.commandType = "regular";
		this.execute = async (
			client: PrefixClient<true>,
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
		};
	}
}

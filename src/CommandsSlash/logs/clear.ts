/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import { Infractions } from "../../Database/database";
import { Infraction } from "../../Utils/Infraction";

export class LogsClear implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "clear";
		this.description = "Clears the database entry using caseID";
		this.parentName = "logs";
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			const caseId = interaction.options.getString("caseid", true);

			const caseToRemove = await Infractions.findOne({
				where: { caseId },
			});

			if (!caseToRemove)
				return interaction.editReply({
					content: `Case with the ID \`${caseId}\` was not found.`,
				});

			caseToRemove
				.destroy()
				.then(async () => {
					const infraction = new Infraction();
					const embed = infraction.getInfractionEmbed({
						customInfraction: caseToRemove,
					});
					if (!embed) {
						interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP.`,
						});
						return console.log("Could not create an embed.");
					}
					return interaction.editReply({
						embeds: [embed],
						content: `Removed infraction with case ID ${caseToRemove.caseId} for <@${caseToRemove.targetId}>`,
					});
				})
				.catch((err) => {
					console.error(err);
					return interaction.editReply({
						content: `There was an error. Please contact Matrical ASAP.`,
					});
				});

			return;
		};
	}
}

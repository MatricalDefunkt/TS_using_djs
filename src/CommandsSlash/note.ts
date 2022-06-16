/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	BasicCommandTypes,
	Command,
	PrefixClient,
} from "../Types/interface.js";
import { Infraction } from "../Utils/Infraction";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

const data = new SlashCommandBuilder()
	.setName("note")
	.setDescription("Creates a note on the given user.")
	.addUserOption((o) =>
		o.setName("user").setDescription("User to put a note on.").setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("note")
			.setDescription("The note you would like to add onto the user.")
			.setRequired(true)
	);

const jsonData = data.toJSON();

export class Note implements Command {
	name: string;
	description: string;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	commandType: BasicCommandTypes;
	execute: Command["execute"];

	constructor() {
		this.name = "note";
		this.description = "Adds a note onto a user and stores it in DB.";
		this.jsonData = jsonData;
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			if (!interaction.inCachedGuild()) return;

			await interaction.deferReply({ ephemeral: true });
			const userForNote = interaction.options.getMember("user", true);
			const note = interaction.options.getString("note", true);

			const infraction = new Infraction();
			await infraction.addInfraction({
				modID: interaction.user.id,
				target: userForNote.id,
				reason: note,
				type: "Note",
			});
			if (infraction instanceof Error || !infraction.latestInfraction)
				return interaction.editReply({
					content: `There was an error. Please contact Matrical ASAP.`,
				});

			const embed = infraction.getInfractionEmbed();
			if (!embed) {
				console.log("Could not make an embed with case ID. Please check.");
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
		};
	}
}

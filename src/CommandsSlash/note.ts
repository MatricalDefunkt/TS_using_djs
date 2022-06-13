/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Client, CommandInteraction } from "discord.js";
import { Infractions } from "../Database/database";
import { Command, PrefixClient } from "../Types/interface.js";
import { Infraction } from "../Utils/Infraction";

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

export const Note: Command = {
	name: "note",
	description: "Adds a note onto a user and stores it in DB.",
	jsonData,
	execute: async (
		client: PrefixClient,
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
		if (!client.user) return;
		await interaction.editReply({ embeds: [embed] });
	},
};

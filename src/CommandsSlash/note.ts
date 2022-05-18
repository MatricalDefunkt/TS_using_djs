/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Client, CommandInteraction } from "discord.js";
import { Infractions } from "../Database/database";
import { Command, PrefixClient } from "src/Types/interface.js";
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
		await infraction.addNote(interaction.user.id, userForNote.id, note);
		if (infraction.note instanceof Infractions) {
			const dbcaseId = infraction.note.getDataValue("caseID");
			const dbtype = infraction.note.getDataValue("type");
			const dbtarget = `<@${infraction.note.getDataValue("targetID")}>`;
			const dbmod = `<@${infraction.note.getDataValue("modID")}>`;
			const dbreason = infraction.note.getDataValue("reason");
			const dbtime = `<t:${Math.trunc(
				Date.parse(infraction.note.getDataValue("createdAt")) / 1000
			)}:F>`;

			if (!client.user)
				throw new TypeError('client.user is of the type "UNDEFINED"');

			const embed = new MessageEmbed()
				.setAuthor({
					name: client.user.tag,
					iconURL: client.user?.displayAvatarURL(),
				})
				.setColor("YELLOW")
				.setDescription(
					`**Case ID -** ${dbcaseId}\n**Type -** ${dbtype}\n**Target -** ${dbtarget}\n**Moderator -** ${dbmod}\n**Reason -** ${dbreason}\n**Time -** ${dbtime}`
				)
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: interaction.user.tag,
				})
				.setTimestamp();
			await interaction.editReply({ embeds: [embed] });
			return;
		} else {
			return interaction.editReply({
				content: `Could not create entry in database. This is an error. Please contact Matrical ASAP.`,
			});
		}
	},
};

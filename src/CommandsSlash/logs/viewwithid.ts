/** @format */

import { PrefixClient, SubCommand } from "../../Types/interface";

import {
	CommandInteraction,
	MessageEmbed,
	MessageActionRow,
	InteractionCollector,
	MessageButton,
} from "discord.js";
import { Infractions } from "../../Database/database";
import { Model } from "sequelize/types";

export const LogsViewWithID: SubCommand = {
	name: "view_with_id",
	description: "Returns paginated logs for given user ID",
	jsonData: {},
	parentName: "logs",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		const target = interaction.options.getString("target", true);
		if (target.length != 18)
			return interaction.editReply({ content: `Please enter a valid user ID` });

		let counter = 0;
		const { rows: infractions, count: totalCount } =
			await Infractions.findAndCountAll({
				where: { targetID: target },
				limit: 5,
				offset: counter,
			});

		if (infractions.length < 1)
			return interaction.editReply({
				content: `Either <@${target}>'s record is clean or the ID is wrong.`,
			});

		const messageBuilder: string[] = [];

		infractions.forEach(function (infraction): void {
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
			messageBuilder.push(
				`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
					type == "Note" ? `**Note**` : `**Reason**`
				} - ${reason}\n**Time** - ${time}${
					duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
				}`
			);
		});

		const embed = new MessageEmbed()
			.setAuthor({
				name: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setDescription(messageBuilder.join("\n**======**\n"))
			.setColor(
				messageBuilder.join().includes("Type - Ban") ? "RED" : "YELLOW"
			);

		const row = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId("previous")
				.setEmoji("◀️")
				.setStyle("SECONDARY"),
			new MessageButton()
				.setCustomId("next")
				.setEmoji("▶️")
				.setStyle("SECONDARY"),
		]);

		const disabledRow = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId("previous")
				.setEmoji("◀️")
				.setStyle("SECONDARY")
				.setDisabled(true),
			new MessageButton()
				.setCustomId("next")
				.setEmoji("▶️")
				.setStyle("SECONDARY")
				.setDisabled(true),
		]);

		const reply = await interaction.editReply({
			embeds: [embed],
			components: [row],
		});

		const collector = new InteractionCollector(client, {
			message: reply,
			componentType: "BUTTON",
			interactionType: "MESSAGE_COMPONENT",
			time: 300_000,
		});

		collector.on("collect", async (collected) => {
			if (!collected.isButton()) return;

			await collected.deferUpdate();

			if (collected.customId === "next") {
				if (counter + 5 >= totalCount)
					return collected.reply({
						content: "No more pages after this!",
						ephemeral: true,
					});

				counter += 5;

				const localInfractions = await Infractions.findAll({
					where: { targetID: target },
					limit: 5,
					offset: counter,
				});
				const loacalMessageBuilder: string[] = [];

				localInfractions.forEach((infraction) => {
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
					loacalMessageBuilder.push(
						`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
							type == "Note" ? `**Note**` : `**Reason**`
						} - ${reason}\n**Time** - ${time}${
							duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
						}`
					);
				});

				const localEmbed = new MessageEmbed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setDescription(loacalMessageBuilder.join("\n**======**\n"))
					.setColor(
						loacalMessageBuilder.join().includes("Type - Ban")
							? "RED"
							: "YELLOW"
					);

				await collected.update({ embeds: [localEmbed] });
			} else {
				if (counter - 5 < 0)
					return collected.reply({
						content: "No more pages before this!",
						ephemeral: true,
					});

				counter -= 5;

				const localInfractions = await Infractions.findAll({
					where: { targetID: target },
					limit: 5,
					offset: counter,
				});
				const loacalMessageBuilder: string[] = [];

				localInfractions.forEach((infraction) => {
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
					loacalMessageBuilder.push(
						`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
							type == "Note" ? `**Note**` : `**Reason**`
						} - ${reason}\n**Time** - ${time}${
							duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
						}`
					);
				});

				const localEmbed = new MessageEmbed()
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setDescription(loacalMessageBuilder.join("\n**======**\n"))
					.setColor(
						loacalMessageBuilder.join().includes("Type - Ban")
							? "RED"
							: "YELLOW"
					);

				await collected.update({ embeds: [localEmbed] });
			}
		});

		collector.on("end", async (collected) => {
			try {
				await interaction.editReply({ components: [disabledRow] });
			} catch (error) {
				console.error(error);
			}
		});
		return;
	},
};

/** @format */

import {
	CommandInteraction,
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	InteractionCollector,
} from "discord.js";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import { Infractions } from "../../Database/database";

export class LogsReason implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "set-reason";
		this.description = "Changes the reason of infraction in DB.";
		this.commandType = "infraction";
		this.parentName = "logs";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			const caseID = interaction.options.getString("caseid", true);
			const newReason = interaction.options.getString("reason", true);

			const infraction = await Infractions.findByPk(caseID);

			if (!infraction)
				return interaction.editReply({
					content: `Infraction with the caseID of \`${caseID}\` does not exist.`,
				});

			const row = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yeschange")
					.setEmoji("✅")
					.setLabel("Yes, change.")
					.setStyle("DANGER"),
				new MessageButton()
					.setCustomId("nocancel")
					.setEmoji("❎")
					.setLabel("No, cancel.")
					.setStyle("SUCCESS"),
			]);
			const disabledRow = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yeschange")
					.setEmoji("✅")
					.setLabel("Yes, change.")
					.setStyle("DANGER")
					.setDisabled(true),
				new MessageButton()
					.setCustomId("nocancel")
					.setEmoji("❎")
					.setLabel("No, cancel.")
					.setStyle("SUCCESS")
					.setDisabled(true),
			]);

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

			const embed = new MessageEmbed().setDescription(
				`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
					type == "Note" ? `**Note**` : `**Reason**`
				} - ${reason}\n**Time** - ${time}${
					duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
				}`
			);

			if (!client.user) return;

			embed
				.setColor(type === "Ban" ? "RED" : "YELLOW")
				.setAuthor({
					name: client.user.tag,
					iconURL: client.user.displayAvatarURL(),
				})
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: interaction.user.tag,
				})
				.setTimestamp();

			if (!embed)
				return interaction.editReply({
					content: `There was an error. Please check the case ID.`,
				});

			const reply = await interaction.editReply({
				content: `Are you sure you want to ${
					infraction.getDataValue("reason") === "None provided."
						? `set`
						: `change`
				} the reason to \`${newReason}\``,
				embeds: [embed],
				components: [row],
			});

			const collector = new InteractionCollector(client, {
				message: reply,
				time: 60_000,
				max: 1,
				interactionType: "MESSAGE_COMPONENT",
				componentType: "BUTTON",
			});

			collector.on("collect", async (collected) => {
				if (!collected.isButton()) return;
				if (collected.customId === "yeschange") {
					infraction
						.update({ reason: newReason }, { where: { caseID: caseID } })
						.then(async (newInfraction) => {
							const caseId = newInfraction.getDataValue("caseID");
							const type = newInfraction.getDataValue("type");
							const target = `<@${newInfraction.getDataValue("targetID")}>`;
							const mod = `<@${newInfraction.getDataValue("modID")}>`;
							const reason = newInfraction.getDataValue("reason");
							const time = `<t:${Math.trunc(
								Date.parse(newInfraction.getDataValue("createdAt")) / 1000
							)}:F>`;
							const duration =
								newInfraction.getDataValue("duration") === "Completed"
									? `Completed.`
									: `<t:${infraction.getDataValue("duration")}:F>`;
							const description = `**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
								type == "Note" ? `**Note**` : `**Reason**`
							} - ${reason}\n**Time** - ${time}${
								duration != "<t:null:F>" ? `\n**Duration** - ${duration}` : ``
							}`;
							embed.setDescription(description);

							return collected.update({
								content: `New ${
									type == "Note" ? `note` : `reason`
								} has been set to \`${newReason}\``,
								embeds: [embed],
								components: [disabledRow],
							});
						})
						.catch((reason) => {
							console.error(reason);
							return collected.update({
								content: `There was an error. Please contact Matrical ASAP.`,
								components: [disabledRow],
							});
						});
				} else {
					return collected.update({
						content: `Cancelled reason change. Here is the new reason for your reference:\n\`${newReason}\``,
						components: [disabledRow],
					});
				}
			});

			collector.on("end", async (collected, reason) => {
				if (collected.size < 1)
					await interaction.editReply({
						content: `You did not click a button in time.`,
						components: [disabledRow],
					});
				return;
			});
		};
	}
}

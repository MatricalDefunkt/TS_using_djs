/** @format */

import {
	Client,
	CommandInteraction,
	MessageEmbed,
	InteractionCollector,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import { PrefixClient, SubCommand } from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
import { Infractions } from "../../Database/database";

export const LogsView: SubCommand = {
	name: "view",
	description: "Returns the infractions, in a paginated form.",
	jsonData: {},
	parentName: "logs",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		const target = interaction.options.getUser("target", true);

		if (!target) return interaction.editReply("Invalid input for `target`.");

		let counter = 0;
		const { rows: infractions, count: totalCount } =
			await Infractions.findAndCountAll({
				where: { targetID: target.id },
				limit: 5,
				offset: counter,
			});

		if (!infractions[0])
			return interaction.editReply({
				content: `${target}'s record is clean. ✅`,
			});

		const infraction = new Infraction();

		const embeds: MessageEmbed[] = [];

		infractions.forEach((infractionElement) => {
			const embed = infraction.getInfractionEmbed({
				customInfraction: infractionElement,
			});
			const isEmbed = (x: any): x is MessageEmbed => {
				if (x.description) return true;
				return false;
			};

			if (!isEmbed(embed)) {
				console.log("Could not make an embed with case ID. Please check.");
				return interaction.editReply({
					content: `There was an error. Please contact Matrical ASAP`,
				});
			}

			if (!client.user) return;

			embed
				.setAuthor({
					name: client.user.tag,
					iconURL: client.user.displayAvatarURL(),
				})
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: interaction.user.tag,
				})
				.setTimestamp();
			embeds.push(embed);
		});

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
			embeds: embeds,
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

			if (!collected.inCachedGuild()) return;

			if (collected.customId === "next") {
				if (counter + 5 >= totalCount)
					return collected.reply({
						content: "No more pages after this!",
						ephemeral: true,
					});

				counter += 5;

				await collected.deferUpdate();

				const localInfractions = await Infractions.findAll({
					where: { targetID: target.id },
					limit: 5,
					offset: counter,
				});
				const localEmbeds: MessageEmbed[] = [];

				localInfractions.forEach((infractionElement) => {
					const embed = infraction.getInfractionEmbed({
						customInfraction: infractionElement,
					});

					const isEmbed = (x: any): x is MessageEmbed => {
						if (x.description) return true;
						return false;
					};

					if (!isEmbed(embed)) {
						console.log("Could not make an embed with case ID. Please check.");
						return interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP`,
						});
					}

					if (!client.user) return;

					embed
						.setAuthor({
							name: client.user.tag,
							iconURL: client.user.displayAvatarURL(),
						})
						.setFooter({
							iconURL: interaction.user.displayAvatarURL(),
							text: interaction.user.tag,
						})
						.setTimestamp();
					localEmbeds.push(embed);
				});

				await collected.editReply({ embeds: localEmbeds });
			} else {
				if (counter - 5 < 0)
					return collected.reply({
						content: "No more pages before this!",
						ephemeral: true,
					});

				counter -= 5;

				await collected.deferUpdate();

				const localInfractions = await Infractions.findAll({
					where: { targetID: target.id },
					limit: 5,
					offset: counter,
				});
				const localEmbeds: MessageEmbed[] = [];

				localInfractions.forEach((infractionElement) => {
					const embed = infraction.getInfractionEmbed({
						customInfraction: infractionElement,
					});

					const isEmbed = (x: any): x is MessageEmbed => {
						if (x.description) return true;
						return false;
					};

					if (!isEmbed(embed)) {
						console.log("Could not make an embed with case ID. Please check.");
						return interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP`,
						});
					}

					if (!client.user) return;

					embed
						.setAuthor({
							name: client.user.tag,
							iconURL: client.user.displayAvatarURL(),
						})
						.setFooter({
							iconURL: interaction.user.displayAvatarURL(),
							text: interaction.user.tag,
						})
						.setTimestamp();
					localEmbeds.push(embed);
				});

				await collected.editReply({ embeds: localEmbeds });
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

/** @format */

import {
	Client,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	InteractionCollector,
	InteractionCollectorOptions,
	Modal,
	TextInputComponent,
	ModalActionRowComponent,
} from "discord.js";
import { Op, col } from "sequelize";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import { Infractions } from "../../Database/database";

export class BanConvert implements SubCommand {
	name: string;
	description: string;
	infractionEmbed: any;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "";
		this.description = "Converts ban to or from ";
		this.parentName = "ban";
		this.infractionEmbed = null;
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			let returnEmbed;

			const caseID = interaction.options.getString("case-id", true);
			const reason = interaction.options.getString("reason", true);

			const convertData = await Infractions.findByPk(caseID);
			if (!convertData)
				return interaction.editReply({
					content: `Entry with caseID of \`${caseID}\` does not exist.`,
				});

			const banType = convertData.getDataValue("type");
			if (banType != "TempBan" || banType != "Ban")
				return interaction.editReply({
					content: `Type of infraction must be \`Ban\` or \`Temporary Ban\``,
				});

			const convertRow = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yesconvert")
					.setLabel("Yes, convert.")
					.setEmoji("✅")
					.setStyle("DANGER"),
				new MessageButton()
					.setCustomId("nocancel")
					.setLabel("No, cancel.")
					.setEmoji("❎")
					.setStyle("SECONDARY"),
			]);

			const convertRowDisabled = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yesconvert")
					.setLabel("Yes, convert.")
					.setEmoji("✅")
					.setStyle("DANGER")
					.setDisabled(true),
				new MessageButton()
					.setCustomId("nocancel")
					.setLabel("No, cancel.")
					.setEmoji("❎")
					.setStyle("SECONDARY")
					.setDisabled(true),
			]);

			const durationRow = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yeschange")
					.setLabel("Yes, change.")
					.setEmoji("✅")
					.setStyle("DANGER"),
				new MessageButton()
					.setCustomId("nodontchange")
					.setLabel("No, cancel.")
					.setEmoji("❎")
					.setStyle("SECONDARY"),
			]);

			const durationRowDisabled = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("yeschange")
					.setLabel("Yes, change.")
					.setEmoji("✅")
					.setStyle("DANGER")
					.setDisabled(true),
				new MessageButton()
					.setCustomId("nodontchange")
					.setLabel("No, cancel.")
					.setEmoji("❎")
					.setStyle("SECONDARY")
					.setDisabled(true),
			]);

			const row = new MessageActionRow<ModalActionRowComponent>();
			row.addComponents(
				new TextInputComponent()
					.setStyle("SHORT")
					.setMinLength(2)
					.setMaxLength(10)
					.setCustomId("newtime")
					.setRequired(true)
					.setPlaceholder(
						"Input time in the format xW xD xH where w, d, and h are weeks days and hours."
					)
			);

			const modal = new Modal()
				.setCustomId("durationmodal")
				.setTitle("Ban Convert Form:")
				.setComponents(row);

			if (banType == "TempBan") {
				const completed = convertData.getDataValue("duration") === "Completed";

				if (completed === true) {
					return interaction.editReply({
						content: `<@${convertData.getDataValue(
							"targetID"
						)}> has completed their last temp-ban. Do /ban temporary if you would like to add a new temporary ban for them.`,
					});
				} else {
					const reply = await interaction.editReply({
						content: `<@${convertData.getDataValue(
							"targetID"
						)} will finish their temp-ban <t:${convertData.getDataValue(
							"duration"
						)}:R>. Do you want to change the duration?`,
						components: [durationRow],
					});

					const collector = new InteractionCollector(client, {
						componentType: "BUTTON",
						interactionType: "MESSAGE_COMPONENT",
						message: reply,
						time: 300_000,
					});

					collector.on("collect", async (collected) => {
						if (!collected.isButton()) return;
						if (!collected.inCachedGuild()) return;
						if (collected.customId === "yeschange") {
							await collected.showModal(modal);
							await collected.message.edit({
								components: [durationRowDisabled],
							});
							collected
								.awaitModalSubmit({ time: 300 })
								.then((modal) => {
									modal.deferReply({ ephemeral: true });
									const _duration = modal.fields.getTextInputValue("duration");
									modal.editReply({ content: _duration });
								})
								.catch((err: any) => {});
						}
					});
				}
			}
		};
	}
}

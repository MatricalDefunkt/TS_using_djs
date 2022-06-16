/** @format */

import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";

import {
	Client,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	InteractionCollector,
	Message,
} from "discord.js";
import { Infractions } from "../../Database/database";

export class MuteConvert implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "";
		this.description = "Converts a mute into a temp mute or vice-versa";
		this.parentName = "mute";
		this.commandType = "infraction";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			if (!interaction.inCachedGuild()) return;

			const convertId = interaction.options.getString("user-id", true);

			if (interaction.options.getString("user-id", true).length != 18)
				return interaction.editReply({
					content: `Please enter a valid user ID`,
				});

			const reason = interaction.options.getString("reason", true);

			const convertee = await Infractions.findOne({
				where: { userID: convertId },
			});

			const row = new MessageActionRow().addComponents([
				new MessageButton()
					.setCustomId("addtempmute")
					.setLabel("Yes, convert.")
					.setEmoji("✅")
					.setStyle("DANGER"),
				new MessageButton()
					.setCustomId("canceladdtempmute")
					.setLabel("No, cancel.")
					.setEmoji("❎")
					.setStyle("SUCCESS"),
			]);

			if (!convertee) {
				const reply = await interaction.editReply({
					content: `User with the ID ${convertId} does not exist in temporary mutes. Do you want to add their mute to temporary mutes? You have 5 minutes to decide.`,
					components: [row],
				});

				const buttonCollector = new InteractionCollector(client, {
					componentType: "BUTTON",
					message: reply,
					time: 300_000,
					maxComponents: 1,
				});

				buttonCollector.on("collect", async (collected) => {
					if (!collected.isButton()) return;
					await collected.deferReply({ ephemeral: true });
					if (collected.customId === "addtempmute") {
					}
				});
				return;
			}
			return interaction.editReply({ content: `mute conversion completed.` });
		};
	}
}

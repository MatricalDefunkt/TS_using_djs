/** @format */

import { Client, Interaction } from "discord.js";
import { Event } from "../Types/interface";
import { AutoCompleteCommands, SlashCommands } from "../CommandsSlash/exports";

export const interactionCreate: Event = {
	name: "interactionCreate",
	handle: async (client: Client) => {
		client.on("interactionCreate", async (interaction: Interaction): Promise<any> => {
			if (interaction.isCommand()) {
				const foundCommand = SlashCommands.find(
					(command) => command.name === interaction.commandName
				);
				if (foundCommand) {
					foundCommand.execute(client, interaction);
				} else if (!foundCommand) {
					interaction.reply({
						content: `Command was not found. This is an error. Please contact Matrical ASAP.`,
						ephemeral: true,
					});
				}
			}
			if (interaction.isAutocomplete()) {
				const foundCommand = AutoCompleteCommands.find(
					(command) => command.name === interaction.commandName
				);
				if (foundCommand) {
					foundCommand.respond(client, interaction);
				} else {
					return;
				}
			}
		});
	},
};

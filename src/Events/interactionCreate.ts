/** @format */

import { Interaction } from "discord.js";
import {
	AutoCompleteCommand,
	Command,
	Event,
	PrefixClient,
	SubCommandParent,
} from "../Types/interface";
import { AutoCompleteCommands, SlashCommands } from "../CommandsSlash/exports";
import configs from "../Utils/config.json";

const punishmentLogId = configs.find(
	(config) => config.response.value === "infractionLogId"
)?.value;

export const interactionCreate: Event = {
	name: "interactionCreate",
	handle: async (client: PrefixClient<true>) => {
		client.on(
			"interactionCreate",
			async (interaction: Interaction): Promise<any> => {
				if (interaction.isCommand()) {
					const foundCommand:
						| Command
						| SubCommandParent
						| AutoCompleteCommand
						| undefined = SlashCommands.find(
						(command) => command.name === interaction.commandName
					);
					if (foundCommand) {
						await foundCommand
							.execute(client, interaction)
							.catch((error: any) => {
								interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
								console.log(error);
							});
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
			}
		);
	},
};

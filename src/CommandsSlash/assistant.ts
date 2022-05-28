/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import GoogleAssistant from "google-assistant";
import path from "path";
import { Command, PrefixClient } from "../Types/interface.js";

const data = new SlashCommandBuilder()
	.setName("assistant")
	.setDescription("Talk to Google Assistant!")
	.addStringOption((o) =>
		o
			.setName("query")
			.setDescription("The query for google assistant")
			.setRequired(true)
	);

const jsonData = data.toJSON();

export const Assistant: Command = {
	name: "assistant",
	description: "Allows user to talk to the google assistant.",
	jsonData,
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;
		await interaction.deferReply();

		const defaultConfig = {
			auth: {
				keyFilePath: path.resolve(
					__dirname,
					"../GoogleAssistant/credentials.json"
				),
				savedTokensPath: path.resolve(
					__dirname,
					"../GoogleAssistant/tokens.json"
				),
			},
			conversation: {
				lang: "en-US",
				textQuery: interaction.options.getString("query", true),
				isNew: true, // set this to true if you want to force a new conversation and ignore the old state
				screen: {
					isOn: false,
				},
			},
		};

		const assistant = new GoogleAssistant(defaultConfig.auth);

		const startConversation = (conversation: any) => {
			conversation
				.on("response", async (text: string) => {
					if (text.length < 1)
						return interaction.editReply("The assistant did not reply.");
					await interaction.editReply({
						content: text,
					});
				})
				.on("ended", (error: any, continueConversation: any) => {
					if (error) {
						console.log("Conversation Ended Error:", error);
					} else if (continueConversation) {
						return;
					}
				})
				.on("error", async (error: any) => {
					console.error(error);
					await interaction.editReply({
						content: `There was an error. Please contact Matrical ASAP.`,
					});
				});
		};

		assistant
			.on("ready", () => {
				assistant.start(defaultConfig.conversation);
			})
			.on("started", startConversation);
	},
};

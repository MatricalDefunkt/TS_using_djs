/** @format */

import { Event, PrefixClient } from "../Types/interface";
import * as dotenv from "dotenv";
dotenv.config();
import { Message } from "discord.js";
import configs from "../Utils/config.json";
import path from "path";
import GoogleAssistant from "google-assistant";

const assistantChannelId = configs.find(
	(config) => config.response.value === "assistantChannelId"
)?.value;

export const messageCreateAssistant: Event = {
	name: "messageCreate",
	handle: async (client: PrefixClient<true>) => {
		client.on("messageCreate", async (msg: Message): Promise<any> => {
			if (!msg.guild) return;
			if (msg.author.bot) return;

			if (!assistantChannelId) {
				const errChannel = await msg.guild.channels.fetch(
					configs.find((config) => config.response.value === "modLogId")
						?.value ?? "948089637774188564"
				);
				if (errChannel?.isText())
					errChannel.send(
						"Google assistant channel has not been setup. Please use /config."
					);
			}

			if (msg.channelId !== assistantChannelId) return;

			if (
				msg.cleanContent.includes("--noassist") ||
				msg.cleanContent.includes("-na")
			)
				return;
				
			const authConfig = {
				keyFilePath: path.resolve(
					__dirname,
					"../GoogleAssistant/credentials.json"
				),
				savedTokensPath: path.resolve(
					__dirname,
					"../GoogleAssistant/tokens.json"
				),
			};

			const conversationConfig = {
				lang: "en-US",
				textQuery: msg.cleanContent,
				isNew: false, // set this to true if you want to force a new conversation and ignore the old state
				screen: {
					isOn: false,
				},
			};

			const reply = await msg.reply("<a:okaygoogle:985851551149064203>");

			const assistant = new GoogleAssistant(authConfig);

			const startConversation = (conversation: any) => {
				conversation
					.on("response", async (text: string) => {
						if (text.length < 1)
							return reply.edit("The assistant did not reply. :(");
						await reply.edit({
							content: `<:google:985860919747817492>\n${text}`,
						});
					})
					.on("ended", async (error: any, continueConversation: any) => {
						if (error) {
							console.log("Conversation Ended Error:", error);
							return reply.edit({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						} else if (continueConversation) {
							const filter = (newMsg: Message) =>
								newMsg.author.id === msg.author.id;

							const newMsg = (
								await msg.channel.awaitMessages({ filter })
							).first();

							if (!newMsg) return;

							const newConversation = conversationConfig;
							newConversation.textQuery = newMsg.cleanContent;
							assistant.start(newConversation);

							return;
						}
					})
					.on("error", async (error: any) => {
						console.error(error);
						await reply.edit({
							content: `There was an error. Please contact Matrical ASAP.`,
						});
					});
			};

			assistant
				.on("ready", () => {
					assistant.start(conversationConfig);
				})
				.on("started", startConversation);
		});
	},
};

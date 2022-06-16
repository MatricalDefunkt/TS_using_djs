/** @format */

import { MessageEmbed, TextChannel, Message } from "discord.js";

export class InfractionLogger {
	logChannel: TextChannel;
	finalURL: string | undefined;

	constructor(channel: TextChannel, embed: MessageEmbed) {
		this.logChannel = channel;
		this.#log(embed);
	}

	async #log(embed: MessageEmbed) {
		const channel = this.logChannel;
		const webhooks = await channel.fetchWebhooks();
		const utilityWebhook = webhooks.find(
			(webhook) => webhook.name === "PYL Utilities"
		);
		if (!utilityWebhook) {
			const newUtilityWebhook = await channel
				.createWebhook("PYL Utilities", {
					reason: "Logging webhook",
					avatar: channel.client.user?.displayAvatarURL({ format: "png" }),
				})
				.catch((e) => {
					channel.send({
						content: `There was an error. Please contact Matrical ASAP.`,
					});
					console.error(e);
				});

			if (!newUtilityWebhook)
				return channel.send(
					"There was an error. Please contact Matrical ASAP."
				);
			else {
				const message = await newUtilityWebhook.send({ embeds: [embed] });
				if (isNotAPIMessage(message)) {
					console.log("Logged: " + message.url);
					this.finalURL = message.url;
				}
			}
		} else {
			const message = utilityWebhook.send({ embeds: [embed] });
			if (isNotAPIMessage(message)) {
				console.log("Logged: " + message.url);
				this.finalURL = message.url;
			}
		}
	}
}

const isNotAPIMessage = (x: any): x is Message<true> => {
	if (x.guild) return true;
	else return false;
};

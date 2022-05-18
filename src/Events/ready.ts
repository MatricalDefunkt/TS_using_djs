/** @format */

import { Client } from "discord.js";
import { Event } from "../Types/interface";

export const ready: Event = {
	name: "ready",
	handle: (client: Client): void => {
		client.on("ready", async () => {
			if (!client.user || !client.application) {
				return;
			}
			console.log(`${client.user.username} is online`);
		});
	},
};

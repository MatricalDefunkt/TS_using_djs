/** @format */

import * as dotenv from "dotenv";
dotenv.config();
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommands } from "./CommandsSlash/exports";
const token = process.env.TOKEN;
const guildId = process.env.GUILDID;
const clientId = process.env.CLIENTID;

const commandJsonData: Object[] = [];
SlashCommands.forEach((cmd) => {
	commandJsonData.push(cmd.jsonData);
});

if (!token) throw new Error("Missing token.");
if (!guildId) throw new Error("Missing Guild ID.");
if (!clientId) throw new Error("Missing Client ID.");

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
	try {
		console.log(
			"Started refreshing application (/) commands. (**LOCAL ONLY**)"
		);

		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commandJsonData,
		});

		console.log(
			"Successfully reloaded application (/) commands. (**LOCAL ONLY**)"
		);
	} catch (error) {
		console.error(error);
	}
})();

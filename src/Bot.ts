/** @format */

import { Client, Collection, Intents } from "discord.js";
import { Event } from "./Types/interface";
import dotenv from "dotenv";
import { Events } from "./Events/exports";
import { Prefix } from "./Database/database";

dotenv.config();

console.log("Bot is starting...");

class PrefixClient extends Client {
	declare prefixes: Collection<string, string>;
}

const client = new PrefixClient({
	intents: 66559,
	failIfNotExists: false,
});

client.prefixes = new Collection();

client.once("ready", async () => {
	if (
		!process.env.ERRGUILDID ||
		!process.env.ERRCHANNELID ||
		(typeof process.env.ERRGUILDID !== "string" &&
			typeof process.env.ERRCHANNELID !== "string")
	)
		throw new Error(
			"ErrorGuildID or ErrorChannelID is not available or is of incorrect type."
		);

	const testGuild = await client.guilds.fetch({
		force: false,
		cache: true,
		guild: process.env.ERRGUILDID,
	});
	const errChannel = await testGuild.channels.fetch(process.env.ERRCHANNELID, {
		force: false,
		cache: true,
	});

	if (!errChannel?.isText())
		throw new Error("Error channel does not exist or is not of text type.");
	errChannel.send({
		content: `${
			client.user
		} logged in while watching ${client.guilds.cache.reduce(
			(acc, guild) => acc + guild.memberCount,
			0
		)} members, at the moment, at <t:${Math.trunc(
			client.readyTimestamp ? client.readyTimestamp / 1000 : 0
		)}:F>.`,
	});

	Prefix.findAll().then(async ([command, tag]) => {
		if (!command || !tag) {
			Prefix.findOne({ where: { type: "command" } })
				.then((commandPrefix) => {
					if (!commandPrefix) {
						Prefix.create({
							type: "command",
							prefix: "!!",
						})
							.then((createdPrefix) => {
								client.prefixes.set(
									"command",
									createdPrefix.getDataValue("prefix")
								);
								errChannel.send(
									` Command prefix => \`${client.prefixes.get("command")}\``
								);
							})
							.catch((err) => {
								console.error(err);
								client.destroy();
							});
					} else {
						client.prefixes.set(
							"command",
							commandPrefix.getDataValue("prefix")
						);
						errChannel.send(
							` Command prefix => \`${client.prefixes.get("command")}\``
						);
					}
				})
				.catch((err) => {
					console.error(err);
					client.destroy();
				});
			Prefix.findOne({ where: { type: "tag" } })
				.then((tagPrefix) => {
					if (!tagPrefix) {
						Prefix.create({
							type: "tag",
							prefix: "--",
						})
							.then((createdPrefix) => {
								client.prefixes.set(
									"tag",
									createdPrefix.getDataValue("prefix")
								);
								errChannel.send(
									`Tag prefix => \`${client.prefixes.get("tag")}\``
								);
							})
							.catch((err) => {
								console.error(err);
								client.destroy();
							});
					} else {
						client.prefixes.set("tag", tagPrefix.getDataValue("prefix"));
					}
				})
				.catch((err) => {
					console.error(err);
					client.destroy();
				});
			console.log(client.prefixes);

			return;
		} else {
			if (
				!process.env.ERRGUILDID ||
				!process.env.ERRCHANNELID ||
				(typeof process.env.ERRGUILDID !== "string" &&
					typeof process.env.ERRCHANNELID !== "string")
			)
				throw new Error(
					"ErrorGuildID or ErrorChannelID is not available or is of incorrect type."
				);
			client.prefixes.set("command", command.getDataValue("prefix"));
			client.prefixes.set("tag", tag.getDataValue("prefix"));
			console.log(client.prefixes);
			const testGuild = await client.guilds.fetch({
				force: false,
				cache: true,
				guild: process.env.ERRGUILDID,
			});

			const errChannel = await testGuild.channels.fetch(
				process.env.ERRCHANNELID,
				{
					force: false,
					cache: true,
				}
			);

			if (!errChannel?.isText())
				throw new Error("Error channel does not exist or is not of text type.");
			errChannel.send({
				content: `${
					client.user
				} logged in while watching ${client.guilds.cache.reduce(
					(acc, guild) => acc + guild.memberCount,
					0
				)} members, at the moment, and command prefix \`${client.prefixes.get(
					"command"
				)}\`, along with command prefix of \`${client.prefixes.get(
					"tag"
				)}\` at <t:${Math.trunc(
					client.readyTimestamp ? client.readyTimestamp / 1000 : 0
				)}:F>.`,
			});
			Events.forEach((event: Event) => {
				event.handle(client);
			});
		}
	});
	console.log("Ready!");
	client.user?.setPresence({ status: `idle` });
	client.user?.setActivity({ name: `PYL do PYL stuff`, type: 3 });
});

client.login(process.env.TOKEN);

export { PrefixClient as PrefixClientClass };

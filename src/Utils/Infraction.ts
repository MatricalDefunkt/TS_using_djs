/** @format */

import { Infractions } from "../Database/database";
import uniqid from "uniqid";
import { MessageEmbed, User } from "discord.js";
import { InfractionEmbedOptions } from "../Types/interface";

class Infraction {
	latestInfraction: Infractions | Error | undefined;

	constructor() {
		this.latestInfraction;
	}

	async addInfraction({
		modID,
		target: targetID,
		reason,
		oldType,
		newType,
		type,
		duration,
	}: {
		modID: string;
		target: string;
		reason: string;
		type:
			| "Note"
			| "Warn"
			| "TempMute"
			| "Mute"
			| "Kick"
			| "TempBan"
			| "Ban"
			| "UnMute"
			| "ConvertMute"
			| "UnBan"
			| "ConvertBan";
		newType?: "TempMute" | "Mute" | "TempBan" | "Ban";
		oldType?: "TempMute" | "Mute" | "TempBan" | "Ban";
		duration?: string;
	}): Promise<Infractions | Error> {
		const infraction = await Infractions.create({
			caseID: uniqid(`${type.toLowerCase()}--`),
			type: type,
			targetID,
			modID,
			reason,
			duration: duration ?? null,
		}).catch((error) => console.log(error));
		if (infraction) {
			this.latestInfraction = infraction;
		}
		return Error("Unable to create. Check console for more.");
	}
	/**
	 *
	 * @returns {MessageEmbed} Message embed with the description as the case data.
	 */
	getInfractionEmbed = (
		options?: InfractionEmbedOptions
	): MessageEmbed | void => {
		if (options) {
			if (typeof options.message === "undefined") {
				options.message = true;
			}
			const infraction = options.customInfraction ?? this.latestInfraction;
			if (!infraction)
				throw new Error(
					"Infraction has not been created yet. Use <Infraction>.addInfraction, or give it a custom infraction."
				);
			if (infraction instanceof Error) return console.error(infraction);
			const caseId = infraction.getDataValue("caseID");
			const type = infraction.getDataValue("type");
			const target = `<@${infraction.getDataValue("targetID")}>`;
			const mod = `<@${infraction.getDataValue("modID")}>`;
			const reason = infraction.getDataValue("reason");
			const time = `<t:${Math.trunc(
				Date.parse(infraction.getDataValue("createdAt")) / 1000
			)}:F>`;
			const duration = this.#getDuration(infraction);

			const embed = new MessageEmbed();

			embed
				.setDescription(
					`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
						type == "Note" ? `**Note**` : `**Reason**`
					} - ${reason}\n**Time** - ${time}\n**Duration** - ${duration ?? `N/A`}
					`
				)
				.setColor(type === "Ban" || type === "TempBan" ? "RED" : "YELLOW")
				.setFooter({
					text: options.message === true ? `` : ` Did not recieve DM.`,
				})
				.setTitle(type)
				.setTimestamp();
			return embed;
		} else {
			const infraction = this.latestInfraction;
			if (!infraction)
				throw new Error(
					"Infraction has not been created yet. Use <Infraction>.addInfraction, or give it a custom infraction."
				);
			if (infraction instanceof Error) return console.error(infraction);
			const caseId = infraction.getDataValue("caseID");
			const type = infraction.getDataValue("type");
			const target = `<@${infraction.getDataValue("targetID")}>`;
			const mod = `<@${infraction.getDataValue("modID")}>`;
			const reason = infraction.getDataValue("reason");
			const time = `<t:${Math.trunc(
				Date.parse(infraction.getDataValue("createdAt")) / 1000
			)}:F>`;
			const duration = this.#getDuration(infraction);

			const embed = new MessageEmbed();

			embed
				.setDescription(
					`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
						type == "Note" ? `**Note**` : `**Reason**`
					} - ${reason}\n**Time** - ${time}\n**Duration** - ${duration ?? `N/A`}
					`
				)
				.setColor(type === "Ban" || type === "TempBan" ? "RED" : "YELLOW")
				.setTitle(type)
				.setTimestamp();
			return embed;
		}
	};

	/**
	 *
	 * @returns {string} String of text which is made up of all the values an infraction provides.
	 */
	getInfractionText = ({
		customInfraction,
	}: {
		customInfraction?: Infractions;
	} = {}): string | void => {
		const infraction = customInfraction ?? this.latestInfraction;
		if (!infraction)
			throw new Error(
				"Infraction has not been created yet. Use <Infraction>.addInfraction"
			);
		if (infraction instanceof Error) return console.error(infraction);
		const caseId = infraction.getDataValue("caseID");
		const type = infraction.getDataValue("type");
		const target = `<@${infraction.getDataValue("targetID")}>`;
		const mod = `<@${infraction.getDataValue("modID")}>`;
		const reason = infraction.getDataValue("reason");
		const time = `<t:${Math.trunc(
			Date.parse(infraction.getDataValue("createdAt")) / 1000
		)}:F>`;
		const duration = this.#getDuration(infraction);

		const text = `**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
			type == "Note" ? `**Note**` : `**Reason**`
		} - ${reason}\n**Time** - ${time}\n**Duration** - ${duration ?? `N/A`}`;
		return text;
	};
	#getDuration(infraction: Infractions): string | undefined {
		const duration: string | null = infraction.getDataValue("duration");
		if (!duration) {
			return;
		}
		if (duration === `Completed`) return "Completed";

		return `<t:` + String(Math.trunc(parseInt(duration, 10) / 1000)) + `:F>`;
	}
}

export { Infraction };

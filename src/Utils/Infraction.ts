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
			type: oldType ? `${oldType} => ${type}` : type,
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
			if (!options.message) {
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
			const duration =
				infraction.getDataValue("duration") === "Completed"
					? `Completed.`
					: `<t:${Math.trunc(
							parseInt(infraction.getDataValue("duration")) / 1000
					  )}:F>`;

			const embed = new MessageEmbed();

			embed
				.setDescription(
					`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
						type == "Note" ? `**Note**` : `**Reason**`
					} - ${reason}\n**Time** - ${time}${
						duration != "<t:null:F>" || "<t:NaN:F>"
							? `\n**Duration** - ${duration}`
							: ``
					}`
				)
				.setColor(type === "Ban" || type === "TempBan" ? "RED" : "YELLOW")
				.setFooter({
					text: options.message === true ? `` : ` Did not recieve DM.`,
				})
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
			const duration =
				infraction.getDataValue("duration") === "Completed"
					? `Completed.`
					: `<t:${Math.trunc(
							parseInt(infraction.getDataValue("duration")) / 1000
					  )}:F>` ?? undefined;

			const embed = new MessageEmbed();

			embed
				.setDescription(
					`**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
						type == "Note" ? `**Note**` : `**Reason**`
					} - ${reason}\n**Time** - ${time}${
						duration != "<t:null:F>" || "<t:NaN:F>"
							? `\n**Duration** - ${duration}`
							: ``
					}`
				)
				.setColor(type === "Ban" || type === "TempBan" ? "RED" : "YELLOW")
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
		const duration =
			infraction.getDataValue("duration") === "Completed"
				? `Completed.`
				: `<t:${Math.trunc(
						parseInt(infraction.getDataValue("duration")) / 1000
				  )}:F>` ?? undefined;

		const text = `**Case ID** - ${caseId}\n**Type** - ${type}\n**Target** - ${target}\n**Moderator** - ${mod}\n${
			type == "Note" ? `**Note**` : `**Reason**`
		} - ${reason}\n**Time** - ${time}${
			duration != "<t:null:F>" || "<t:NaN:F>"
				? `\n**Duration** - ${duration}`
				: ``
		}`;
		return text;
	};
}

export { Infraction };

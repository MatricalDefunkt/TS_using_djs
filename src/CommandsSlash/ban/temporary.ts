/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import { Op } from "sequelize";
import { Infractions } from "../../Database/database";
import { SubCommand, PrefixClient } from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
import { rules } from "../../Utils/rules.json";

export const BanTemporary: SubCommand = {
	name: "temporary",
	description:
		"Adds a temporary ban in the DB, which is linked to a continuous check loop",
	jsonData: {},
	parentName: "ban",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		if (!interaction.inCachedGuild()) return;

		const bannee = interaction.options.getMember("user", true);
		let _reason = interaction.options.getInteger("reason", true);
		const time = interaction.options.getInteger("msg-history", true);
		const _duration = interaction.options.getString("duration", true);
		const customReason = interaction.options.getString("custom-reason");

		const durationTimeRegEx = new RegExp(/\d+(?<![wdh])/gi);
		const durationTypeRegEx = new RegExp(/[wdh]/gi);

		const durationArray = _duration.match(durationTimeRegEx);

		const durationTypes = _duration.match(durationTypeRegEx);

		if (
			!durationArray ||
			durationArray.length < 1 ||
			!durationTypes ||
			durationTypes.length < 1 ||
			durationTypes.length !== durationArray.length
		)
			return interaction.editReply({
				content: `Invalid arguements for \`duration\`. Please input duration in the format of \`xW xD xH\`.${
					customReason
						? `\nHere is your custom reason for your reference:\n${customReason}`
						: ``
				}`,
			});

		const durationMap = new Map<string, string>();

		for (const durationType of durationTypes) {
			const index = durationTypes.findIndex((t) => t === durationType);
			durationMap.set(durationType.toLowerCase(), durationArray[index]);
		}

		let durationTimestamp: number;

		let duration = {
			weeks: 0,
			days: 0,
			hours: 0,
		};

		function getTime(x: string): number {
			const timeString = durationMap.get(x);
			if (!timeString) return 0;
			return parseInt(timeString);
		}

		duration.weeks = getTime("w");
		duration.days = getTime("d");
		duration.hours = getTime("h");

		if (duration.days < 1 && duration.weeks < 1 && duration.hours < 1)
			return interaction.editReply({
				content: `Minimum duration of a ban is 1H, sadly.`,
			});

		durationTimestamp =
			Math.trunc(interaction.createdTimestamp / 1000) +
			(duration.weeks * 604800 + duration.days * 86400 + duration.hours * 3600);

		if (!bannee)
			return interaction.editReply({
				content: `The person you want to ban is not a member of this discord server.`,
			});

		if (bannee.bannable == false) {
			return interaction.editReply({
				content: `I cannot ban ${bannee}. They're too powerful 🤯!!`,
			});
		} else if (interaction.member === bannee) {
			return interaction.editReply({
				content: `Okay, you have been banned. Now move on.`,
			});
		}

		let reason: { id: number; reason: string; rule: string };

		const foundRule = rules.find((rule) => rule.id == _reason);

		if (_reason === 0) {
			reason = {
				id: 0,
				reason: customReason ? customReason : "None provided.",
				rule: customReason ? customReason : "None provided.",
			};
		} else {
			reason = foundRule
				? foundRule
				: { id: 404, rule: "Not found.", reason: "Not found." };
		}

		if (reason.id === 404) {
			console.log(
				"Rule with id" +
					_reason +
					"was not found. Please check rules.json asap."
			);
			return interaction.editReply({
				content: `There was an error. Please contact Matrical ASAP.`,
			});
		}

		const disputable = interaction.options.getBoolean("disputable");
		let disputableReply;

		if (disputable === false) {
			disputableReply = `Since this ban has been set as non-disputable, you may not dispute it, as it is now final.`;
		} else {
			disputableReply = `Since this ban has been set as disputable, you may join [this](https://discord.gg/UEwR4CUrug) server and dispute the ban there.`;
		}

		if (!client.user) return;

		const oldTempBan = await Infractions.findOne({
			where: { targetID: bannee.id, duration: { [Op.ne]: `Completed` } },
		});

		if (!oldTempBan) {
			try {
				const dmChannel = await bannee.createDM(true);
				dmChannel
					.send({
						content: `Message from Practice Your Language:`,
						embeds: [
							new MessageEmbed()
								.setAuthor({
									name: client.user.tag,
									iconURL: client.user.displayAvatarURL({ size: 512 }),
								})
								.setColor("RED")
								.setDescription("A message from PYL staff:")
								.addField(
									"Message:",
									"You have been `TEMPORARILY` banned from PYL for breaking (a) server rule(s)\nThe ban will expire in"
								)
								.addField("Rule:", reason.rule)
								.addField("Dispute:", disputableReply)
								.addField(
									"Duration:",
									`You will be unbanned in <t:${durationTimestamp}:R>`
								),
						],
					})
					.then(() => {
						interaction.editReply({
							content: `${bannee} has recieved the ban message.\nBanning now...`,
						});
						bannee
							.ban({
								days: time,
								reason: `${interaction.user.tag} || ${reason.reason}`,
							})
							.then(async () => {
								await interaction.editReply({
									content: `${bannee} has been banned. They will be unbanned <t:${durationTimestamp}:R>`,
								});
								const infraction = new Infraction();
								await infraction.addInfraction({
									modID: interaction.user.id,
									target: bannee.user.id,
									reason: reason.reason,
									type: "TempBan",
									duration: String(durationTimestamp),
								});

								if (infraction instanceof Error || !infraction.latestInfraction)
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});

								const embed = await infraction.getInfractionEmbed();
								if (!embed) {
									console.log(
										"Could not make an embed with case ID. Please check."
									);
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP`,
									});
								}
								if (embed instanceof Error) {
									console.error(embed);
									interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
								}
								const isError = (x: any): x is Error => {
									if (x instanceof Error) return true;
									return false;
								};
								if (isError(embed)) {
									console.error(embed);
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
								}

								if (!embed || !client.user) {
									console.log(`Could not create embed.`);
									return interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
								}

								if (!client.user) return;

								embed
									.setAuthor({
										name: client.user.tag,
										iconURL: client.user.displayAvatarURL(),
									})
									.setFooter({
										iconURL: interaction.user.displayAvatarURL(),
										text: interaction.user.tag,
									})
									.setTimestamp();
								await interaction.editReply({ embeds: [embed] });
							})
							.catch((rejectedReason) => {
								interaction.editReply({
									content: `Something went wrong. Please contact Matrical ASAP.`,
								});
								console.log(rejectedReason);
							});
					});
			} catch (e: any) {
				if (e.code === 50007) {
					await interaction.editReply({
						content: `Cannot send messages to ${bannee}\nBanning now...`,
					});
					bannee
						.ban({
							days: time,
							reason: `${interaction.user.tag} || ${reason.reason}`,
						})
						.then(async () => {
							interaction.editReply({
								content: `${bannee} has been banned. They will be unbanned <t:${durationTimestamp}:R>`,
							});
							const infraction = new Infraction();
							await infraction.addInfraction({
								modID: interaction.user.id,
								target: bannee.user.id,
								reason: reason.reason,
								type: "TempBan",
								duration: String(durationTimestamp),
							});

							if (infraction instanceof Error || !infraction.latestInfraction)
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});

							const embed = await infraction.getInfractionEmbed();
							if (!embed) {
								console.log(
									"Could not make an embed with case ID. Please check."
								);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP`,
								});
							}
							if (embed instanceof Error) {
								console.error(embed);
								interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}
							const isError = (x: any): x is Error => {
								if (x instanceof Error) return true;
								return false;
							};
							if (isError(embed)) {
								console.error(embed);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}

							if (!embed || !client.user) {
								console.log(`Could not create embed.`);
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}

							if (!client.user) return;

							embed
								.setAuthor({
									name: client.user.tag,
									iconURL: client.user.displayAvatarURL(),
								})
								.setFooter({
									iconURL: interaction.user.displayAvatarURL(),
									text: interaction.user.tag,
								})
								.setTimestamp();
							await interaction.editReply({ embeds: [embed] });
						})
						.catch((rejectedReason) => {
							interaction.editReply({
								content: `Something went wrong. Please contact Matrical ASAP.`,
							});
							console.log(rejectedReason);
						});
				}
			}
		} else {
			return interaction.editReply({
				content: `${bannee} already has a remaining temp ban, which ends on <t:${oldTempBan.getDataValue(
					"duration"
				)}:F>. Please use /ban convert if you would like to convert the ban.`,
			});
		}
	},
};
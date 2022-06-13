/** @format */

import { CommandInteraction, MessageEmbed } from "discord.js";
import ms from "ms";
import { PrefixClient, SubCommand } from "src/Types/interface";
import { Infraction } from "../../Utils/Infraction";
import { rules } from "../../Utils/rules.json";
import configs from "../../Utils/config.json";

export const MuteTemporary: SubCommand = {
	name: "temporary",
	description: "Temporarily mutes a person",
	jsonData: {},
	parentName: "mute",
	execute: async (
		client: PrefixClient,
		interaction: CommandInteraction
	): Promise<any> => {
		const muteRoleId = configs.find(
			(config) => config.response.value === "muteRoleId"
		)?.value;

		if (!muteRoleId)
			return interaction.editReply({
				content: `Muted role has not been set. Please set it using /config.`,
			});

		if (!interaction.inCachedGuild()) return;
		const mute = interaction.options.getMember("user", true);
		const _reason = interaction.options.getInteger("reason", true);
		const _duration = interaction.options.getString("duration", true);
		const customReason = interaction.options.getString("custom-reason");

		const duration = ms(_duration);

		if (!duration)
			return interaction.editReply({
				content: `Invalid arguements for \`duration\`. Please try again.`,
			});

		const durationTimestamp = String(
			Math.trunc((Date.now() + duration) / 1000)
		);

		if (!mute)
			return interaction.editReply({
				content: `The person you want to ban is not a member of this discord server.`,
			});

		if (mute.id == interaction.user.id)
			return interaction.editReply({
				content: `Okay, you have been muted. Don't you speak anymore 🤫`,
			});

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

		console.log(String(Date.parse(String(duration + Date.now()))));

		if (!client.user) return;

		const dmChannel = await mute.createDM(true);
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
							"You have been `TEMPORARILY` muted in PYL for breaking (a) server rule(s)"
						)
						.addField("Rule:", reason.rule)
						.addField(
							"Duration:",
							`You will be unmuted <t:${durationTimestamp}:R>`
						),
				],
			})
			.then(async (message) => {
				await interaction.editReply({
					content: `User has recieved the DM. Muting now...`,
				});
				mute.roles
					.add(muteRoleId)
					.then(async (member) => {
						const infraction = new Infraction();

						await infraction.addInfraction({
							modID: interaction.user.id,
							target: mute.id,
							reason: reason.reason,
							type: "TempMute",
							duration: String(duration + Date.now()),
						});

						const embed = infraction.getInfractionEmbed();

						if (!embed) {
							console.error("Could not create embed.");
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						}
						interaction.editReply({ embeds: [embed] });
					})
					.catch((err) => {
						console.error(err);
						return interaction.editReply({
							content: `There was an error. Please contact Matrical ASAP.`,
						});
					});
			})
			.catch(async (err: any) => {
				if (err.code === 50007) {
					await interaction.editReply({
						content: `User has not recieved the DM. Muting now...`,
					});
					mute.roles
						.add(muteRoleId)
						.then(async (member) => {
							const infraction = new Infraction();

							await infraction.addInfraction({
								modID: interaction.user.id,
								target: mute.id,
								reason: reason.reason,
								type: "TempMute",
								duration: String(duration + Date.now()),
							});

							const embed = infraction.getInfractionEmbed({ message: false });

							if (!embed) {
								console.error("Could not create embed.");
								return interaction.editReply({
									content: `There was an error. Please contact Matrical ASAP.`,
								});
							}
							interaction.editReply({ embeds: [embed] });
						})
						.catch((err) => {
							console.error(err);
							return interaction.editReply({
								content: `There was an error. Please contact Matrical ASAP.`,
							});
						});
				}
			});
	},
};

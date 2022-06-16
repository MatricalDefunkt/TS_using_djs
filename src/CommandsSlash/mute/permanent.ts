/** @format */

import {
	CommandInteraction,
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} from "discord.js";
import {
	BasicCommandTypes,
	PrefixClient,
	SubCommand,
} from "../../Types/interface";
import { Infraction } from "../../Utils/Infraction";
import { rules } from "../../Utils/rules.json";
import configs from "../../Utils/config.json";
const muteRoleId = configs.find(
	(config) => config.response.value === "muteRoleId"
)?.value;

export class MutePermanent implements SubCommand {
	name: string;
	description: string;
	parentName: string;
	commandType: BasicCommandTypes;
	execute: SubCommand["execute"];

	constructor() {
		this.name = "permanent";
		this.description = "Applies muted role to a user";
		this.parentName = "mute";
		this.commandType = "regular";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			if (!interaction.inCachedGuild()) return;
			const mute = interaction.options.getMember("user", true);
			let _reason = interaction.options.getInteger("reason", true);
			const customReason = interaction.options.getString("custom-reason");
			4;

			if (!muteRoleId)
				return interaction.editReply({
					content: `Mute Role ID has not been setup. Please ask an admin to do so.`,
				});

			if (!mute)
				return interaction.editReply({
					content: `The person you want to mute is not a member of this discord server.`,
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

			if (mute.roles.cache.has(muteRoleId)) {
				const row = new MessageActionRow().addComponents([
					new MessageButton()
						.setCustomId("yesadd")
						.setLabel("Yes, save.")
						.setEmoji("✅")
						.setStyle("SECONDARY"),
					new MessageButton()
						.setCustomId("nocancel")
						.setLabel("No, cancel.")
						.setEmoji("❎")
						.setStyle("SECONDARY"),
				]);
				const disabledRow = new MessageActionRow().addComponents([
					new MessageButton()
						.setCustomId("yesadd")
						.setLabel("Yes, save.")
						.setEmoji("✅")
						.setStyle("SECONDARY")
						.setDisabled(true),
					new MessageButton()
						.setCustomId("nocancel")
						.setLabel("No, cancel.")
						.setEmoji("❎")
						.setStyle("SECONDARY")
						.setDisabled(true),
				]);
				const reply = await interaction.editReply({
					content: `<@${mute.id}> already has the muted role. Do you want to still store this infraction?`,
					components: [row],
				});
				reply
					.awaitMessageComponent({ time: 120_000, componentType: "BUTTON" })
					.then(async (collected) => {
						if (collected.customId === "yesadd") {
							const infraction = new Infraction();
							await infraction.addInfraction({
								modID: interaction.user.id,
								target: mute.id,
								reason: reason.reason,
								type: "Mute",
							});
							await collected.update({
								content: `Done!`,
								components: [disabledRow],
							});
							const embed = infraction.getInfractionEmbed();
							if (!embed)
								return interaction.editReply({
									content: `Something went wrong. Please contact Matrical ASAP.`,
								});
							embed.addField(
								"Note:",
								"Only added mute to database. Did not perform any changes on" +
									mute.id
							);
							client.emit("loggerCreate", {
								embed,
								interaction,
								type: "infraction",
							});
							await interaction.editReply({
								embeds: [embed],
								components: [disabledRow],
							});
							return;
						} else {
							await collected.update({
								content: `Okay, cancelled.`,
								components: [disabledRow],
							});
							return;
						}
					})
					.catch(async (err) => {
						console.error(err);
						return interaction.editReply({
							content: `You did not click a button in time. No action was taken.`,
							components: [disabledRow],
						});
					});
				return;
			} else {
				const infraction = new Infraction();
				mute.roles
					.add(muteRoleId, `${interaction.user.tag} || ${reason.reason}`)
					.then(async (result) => {
						await infraction.addInfraction({
							modID: interaction.user.id,
							target: mute.id,
							reason: reason.reason,
							type: "Mute",
						});

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
											"You have been muted in PYL for breaking (a) server rule(s)"
										)
										.addField("Rule:", reason.rule)
										.addField(
											"Dispute:",
											"You may dispute this mute, if you so wish, in <#945355751260557396>"
										),
								],
							})
							.then(async () => {
								const embed = infraction.getInfractionEmbed();
								if (!embed)
									return interaction.editReply({
										content: `Something went wrong. Please contact Matrical ASAP.`,
									});
								client.emit("loggerCreate", {
									embed,
									interaction,
									type: "infraction",
								});
								interaction.editReply({ embeds: [embed] });
							})
							.catch((e) => {
								if (e.code === 50007) {
									interaction
										.editReply({ content: `Cannot send messages to ${mute}` })
										.then(async () => {
											const embed = infraction.getInfractionEmbed({
												message: false,
											});
											if (!embed)
												return interaction.editReply({
													content: `Something went wrong. Please contact Matrical ASAP.`,
												});
											client.emit("loggerCreate", {
												embed,
												interaction,
												type: "infraction",
											});
											interaction.editReply({ embeds: [embed] });
										})
										.catch((rejectedReason) => {
											interaction.editReply({
												content: `Something went wrong. Please contact Matrical ASAP.`,
											});
											console.log(rejectedReason);
										});
								} else {
									console.error(e);
									interaction.editReply({
										content: `There was an error. Please contact Matrical ASAP.`,
									});
								}
							});
					})
					.catch((err) => {
						console.error(err);
						interaction.editReply({
							content: `Could not add muted role to user. Please contact Matrical ASAP and also check permissions.`,
						});
					});
			}
		};
	}
}

/** @format */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	MessageEmbed,
	Client,
	CommandInteraction,
	AutocompleteInteraction,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
} from "discord.js";
import languageResponse from "../Utils/languagecodes.json";
import translate from "@vitalets/google-translate-api";
import {
	AutoCompleteCommand,
	BasicCommandTypes,
	PrefixClient,
} from "../Types/interface";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

const data = new SlashCommandBuilder()
	.setName("translate")
	.setDescription("Translate... What else")
	.addStringOption((o) =>
		o
			.setName("text")
			.setDescription("The text you would like to translate")
			.setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("language-to")
			.setDescription("The language you would like to translate to.")
			.setAutocomplete(true)
			.setRequired(true)
	)
	.addStringOption((o) =>
		o
			.setName("language-from")
			.setDescription(
				"The language you would like to translate from. Will use detect-language by default."
			)
			.setAutocomplete(true)
			.setRequired(true)
	);

const jsonData = data.toJSON();

export class Translate implements AutoCompleteCommand {
	name: string;
	description: string;
	jsonData: RESTPostAPIApplicationCommandsJSONBody;
	commandType: BasicCommandTypes;
	execute: (
		client: PrefixClient<true>,
		interaction: CommandInteraction
	) => Promise<any>;
	respond: (
		client: Client,
		interaction: AutocompleteInteraction
	) => Promise<any>;

	constructor() {
		this.name = "translate";
		this.description =
			"Translates given text by referring to language codes, using Google Translate.";
		this.jsonData = jsonData;
		this.commandType = "regular";
		this.execute = async (
			client: PrefixClient<true>,
			interaction: CommandInteraction
		): Promise<any> => {
			if (!interaction.inCachedGuild()) return;

			await interaction.deferReply({ fetchReply: true });

			const text = interaction.options.getString("text", true);
			const langToIso = interaction.options.getString("language-to", true);
			const langFromIso = interaction.options.getString("language-from", true);

			if (
				!languageResponse.find((lang) => lang.value === langToIso) ||
				!languageResponse.find((lang) => lang.value === langFromIso)
			) {
				await interaction.deleteReply();
				return interaction.followUp({
					content: `Please use only the options provided to you. Other languages are not supported.`,
					ephemeral: true,
				});
			}

			try {
				const result = await translate(text, {
					to: langToIso,
					from: langFromIso,
				});

				if (!languageResponse)
					return interaction.editReply({
						content: `Something went wrong. Contact Matrical ASAP.`,
					});

				const fromObject = languageResponse.find(
					(lang) =>
						lang.value ===
						(langFromIso ? langFromIso : result.from.language.iso)
				);
				const toObject = languageResponse.find(
					(lang) => lang.value === langToIso
				);

				const fromName = fromObject ? fromObject.name : "Undefined";
				const toName = toObject ? toObject.name : "Undefined";

				const embed = new MessageEmbed()
					.setFooter({
						text: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle(`Translation ( ${fromName} => ${toName} )`)
					.addField("Translation:", result.text)
					.addField("Original:", text)
					.setColor("RANDOM")
					.setTimestamp();

				if (result.from.text.autoCorrected === true)
					embed.addField("Autocorrected:", result.from.text.value);
				if (result.pronunciation)
					embed.addField("Pronounciation:", result.pronunciation);

				if (result.from.text.didYouMean === true) {
					const row = new MessageActionRow().addComponents([
						new MessageButton()
							.setCustomId("yesimeant")
							.setLabel("Yes")
							.setStyle("PRIMARY"),
						new MessageButton()
							.setCustomId("noididnt")
							.setLabel("No")
							.setStyle("SECONDARY"),
					]);

					const filter = (button: MessageComponentInteraction) =>
						button.user.id === interaction.user.id;
					const reply = await interaction.editReply({
						content: `Did you mean:\n${result.from.text.value}`,
						components: [row],
					});
					reply
						.awaitMessageComponent({
							filter,
							time: 120_000,
							componentType: "BUTTON",
						})
						.then(async (button: MessageComponentInteraction) => {
							if (button.customId === "yesimeant") {
								const didYouMeanText = result.from.text.value
									.replaceAll("[", "`")
									.replaceAll("]", "`");
								const newResult = await translate(didYouMeanText, {
									to: langToIso,
									from: langFromIso,
								});
								const embed = new MessageEmbed()
									.setFooter({
										text: interaction.user.tag,
										iconURL: interaction.user.displayAvatarURL(),
									})
									.setTitle(`Translation ( ${fromName} => ${toName} )`)
									.addField("Translation:", newResult.text)
									.addField("Did You Mean:", didYouMeanText)
									.addField("Original:", text)
									.setColor("RANDOM")
									.setTimestamp();
								if (newResult.pronunciation)
									embed.addField("Pronunciation:", newResult.pronunciation);
								if (newResult.from.text.autoCorrected)
									embed.addField("Autocorrected:", newResult.from.text.value);
								return button.update({
									content: `Updated!`,
									components: [],
									embeds: [embed],
								});
							} else {
								return button.update({
									content: `Unchanged!`,
									components: [],
									embeds: [embed],
								});
							}
						})
						.catch((err: Error) => {
							console.error(err);
							return interaction.editReply({
								components: [],
								content: `Either you did not click on time, or something went wrong.`,
								embeds: [embed],
							});
						});
				} else {
					await interaction.editReply({ embeds: [embed] });
				}
			} catch (error: any) {
				console.log(error.error);
			}
		};
		this.respond = async (
			client: Client,
			interaction: AutocompleteInteraction
		): Promise<any> => {
			try {
				const typing = String(interaction.options.getFocused());

				if (!typing)
					return interaction.respond(
						languageResponse.length > 25
							? languageResponse.slice(0, 25)
							: languageResponse
					);

				const foundLanaguageResponse = languageResponse.filter((lang) =>
					lang.name.toLowerCase().includes(typing.toLowerCase())
				);

				await interaction.respond(
					foundLanaguageResponse.length > 25
						? foundLanaguageResponse.slice(0, 25)
						: foundLanaguageResponse
				);
			} catch (error: any) {
				if (error.name === "Unknown interaction") {
					const testGuild = await client.guilds.fetch({
						force: false,
						cache: true,
						guild: "945355751260557393",
					});
					const errChannel = await testGuild.channels.fetch(
						"948089637774188564",
						{ force: false, cache: true }
					);
					if (errChannel?.isText()) {
						errChannel.send({
							content: `<@714473790939332679>, client is slow to respond to autocomplete interactions.`,
						});
					} else {
						console.error(error);
					}
				} else {
					console.error(error);
				}
			}
		};
	}
}

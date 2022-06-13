/** @format */

import { AutoCompleteCommand, Command } from "../Types/interface";
import { Slow } from "./slow";
import { Translate } from "./translate";
import { Prefix } from "./prefix";
import { Note } from "./note";
import { Logs } from "./logs";
import { Warn } from "./warn";
import { Kick } from "./kick";
import { Ban } from "./ban";
import { Config } from "./config";
import { Mute } from "./mute";

export const SlashCommands: Command[] = [
	Slow,
	Translate,
	Prefix,
	Note,
	Logs,
	Warn,
	Kick,
	Ban,
	Config,
	Mute,
];
export const AutoCompleteCommands: AutoCompleteCommand[] = [Translate, Config];

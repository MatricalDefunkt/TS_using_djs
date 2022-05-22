/** @format */

import { AutoCompleteCommand, Command } from "../Types/interface";
import { Slow } from "./slow";
import { Translate } from "./translate";
import { Prefix } from "./prefix";
import { Note } from "./note";
import { Logs } from "./logs";
import { Warn } from "./warn";
import { Kick } from "./kick";

export const SlashCommands: Command[] = [
	Slow,
	Translate,
	Prefix,
	Note,
	Logs,
	Warn,
	Kick,
];
export const AutoCompleteCommands: AutoCompleteCommand[] = [Translate];

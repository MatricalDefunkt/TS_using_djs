/** @format */

import { AutoCompleteCommand, Command } from "../Types/interface";
import { Slow } from "./slow";
import { Translate } from "./translate";
import { Prefix } from "./prefix";
import { Note } from "./note";
import { Logs } from "./logs";

export const SlashCommands: Command[] = [Slow, Translate, Prefix, Note, Logs];
export const AutoCompleteCommands: AutoCompleteCommand[] = [Translate];

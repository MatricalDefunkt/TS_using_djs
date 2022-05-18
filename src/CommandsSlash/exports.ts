/** @format */

import { AutoCompleteCommand, Command } from "../Types/interface";
import { Slow } from "./slow";
import { Translate } from "./translate";
import { Prefix } from "./prefix";
import { Note } from "./note";

export const SlashCommands: Command[] = [Slow, Translate, Prefix, Note];
export const AutoCompleteCommands: AutoCompleteCommand[] = [Translate];

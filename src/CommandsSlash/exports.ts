/** @format */

import { AutoCompleteCommand, Command } from "../Types/interface";
import { Slow } from "./slow";
import { Translate } from "./translate";

export const SlashCommands: Command[] = [Slow, Translate];
export const AutoCompleteCommands: AutoCompleteCommand[] = [Translate];

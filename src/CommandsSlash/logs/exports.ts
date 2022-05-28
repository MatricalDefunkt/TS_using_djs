/** @format */

import { LogsClear } from "./clear";
import { LogsCount } from "./count";
import { LogsReason } from "./reason";
import { LogsView } from "./view";
import { LogsGet } from "./get";
import { SubCommand } from "../../Types/interface";

export const LogsSubCommands: SubCommand[] = [
	LogsClear,
	LogsCount,
	LogsReason,
	LogsView,
	LogsGet,
];

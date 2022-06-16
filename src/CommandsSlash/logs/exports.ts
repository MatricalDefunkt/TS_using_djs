/** @format */

import { LogsClear } from "./clear";
import { LogsCount } from "./count";
import { LogsReason } from "./reason";
import { LogsView } from "./view";
import { LogsGet } from "./get";
import { SubCommand } from "../../Types/interface";

export const LogsSubCommands: SubCommand[] = [
	new LogsClear(),
	new LogsCount(),
	new LogsReason(),
	new LogsView(),
	new LogsGet(),
];

/** @format */

import { SubCommand } from "../../Types/interface";
import { MuteConvert } from "./convert";
import { MutePermanent } from "./permanent";
import { MuteTemporary } from "./temporary";
import { MuteUndo } from "./undo";

export const MuteSubCommands: SubCommand[] = [
	new MuteUndo(),
	new MuteTemporary(),
	new MutePermanent(),
	new MuteConvert(),
];

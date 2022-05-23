/** @format */

import { SubCommand } from "../../Types/interface";
import { BanConvert } from "./convert";
import { BanPermanant } from "./permanant";
import { BanTemporary } from "./temporary";
import { BanUndo } from "./undo";

export const BanSubCommands: SubCommand[] = [
	BanConvert,
	BanPermanant,
	BanTemporary,
	BanUndo,
];

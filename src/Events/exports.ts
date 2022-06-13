/** @format */

import { Event } from "../Types/interface";
import { interactionCreate } from "./interactionCreate";
import { ready } from "./ready";
import { messageCreate } from "./messageCreate";
import { messageCreateAssistant } from "./messageCreateAssistant";

export const Events: Event[] = [
	interactionCreate,
	ready,
	messageCreate,
	messageCreateAssistant,
];

/** @format */

import { Event } from "../Types/interface";
import { interactionCreate } from "./interactionCreate";
import { ready } from "./ready";
import { messageCreate } from "./messageCreate";

export const Events: Event[] = [interactionCreate, ready, messageCreate];

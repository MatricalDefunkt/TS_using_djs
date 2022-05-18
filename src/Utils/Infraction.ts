/** @format */

import { Infractions } from "../Database/database";
import uniqid from "uniqid";

class Infraction {
	note: Infractions | undefined;
	warn: Infractions | undefined;
	tempMute: Infractions | undefined;
	tempBan: Infractions | undefined;
	convertMute: Infractions | undefined;
	convertBan: Infractions | undefined;
	kick: Infractions | undefined;
	mute: Infractions | undefined;
	ban: Infractions | undefined;
	unMute: Infractions | undefined;
	unban: Infractions | undefined;

	constructor() {
		this.note;
		this.warn;
		this.tempMute;
		this.tempBan;
		this.convertMute;
		this.convertBan;
		this.kick;
		this.mute;
		this.ban;
		this.unMute;
		this.unban;
	}
	async addNote(
		moderatorId: string,
		target: string,
		_note: string
	): Promise<Infractions | Error> {
		const note = await Infractions.create({
			caseID: uniqid("note--"),
			type: "Note",
			targetID: target,
			modID: moderatorId,
			reason: _note,
		}).catch((error) => console.log(error));
		if (note) return (this.note = note);
		return Error("Unable to create. Check console for more.");
	}
	async addBan(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const ban = await Infractions.create({
			caseID: uniqid("ban--"),
			type: "Ban",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (ban) return (this.ban = ban);
		return Error("Unable to create. Check console for more.");
	}
	async addUnBan(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const unban = await Infractions.create({
			caseID: uniqid("unban--"),
			type: "Unban",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (unban) this.unban = unban;
		return Error("Unable to create. Check console for more.");
	}
	async addTempBan(
		moderatorId: string,
		target: string,
		reason: string,
		duration: number
	): Promise<Infractions | Error> {
		const tempBan = await Infractions.create({
			caseID: uniqid("tempban--"),
			type: "TempBan",
			targetID: target,
			modID: moderatorId,
			reason: reason,
			duration: String(duration),
		}).catch((error) => console.log(error));
		if (tempBan) this.tempBan = tempBan;
		return Error("Unable to create. Check console for more.");
	}
	async addTempMute(
		moderatorId: string,
		target: string,
		reason: string,
		duration: number
	): Promise<Infractions | Error> {
		const tempMute = await Infractions.create({
			caseID: uniqid("tempmute--"),
			type: "TempMute",
			targetID: target,
			modID: moderatorId,
			reason: reason,
			duration: String(duration),
		}).catch((error) => console.log(error));
		if (tempMute) this.tempMute = tempMute;
		return Error("Unable to create. Check console for more.");
	}
	async addConvertBan(
		moderatorId: string,
		target: string,
		reason: string,
		oldType: string,
		newType: string,
		newDuration: string
	): Promise<Infractions | Error> {
		const convertBan = await Infractions.create({
			caseID: uniqid("convertban--"),
			type: `${oldType} => ${newType}`,
			targetID: target,
			modID: moderatorId,
			reason: reason,
			duration: newDuration,
		}).catch((error) => console.log(error));
		if (convertBan) this.convertBan = convertBan;
		return Error("Unable to create. Check console for more.");
	}
	async addKick(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const kick = await Infractions.create({
			caseID: uniqid("kick--"),
			type: "Kick",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (kick) this.kick = kick;
		return Error("Unable to create. Check console for more.");
	}
	async addWarn(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const warn = await Infractions.create({
			caseID: uniqid("warn--"),
			type: "Warn",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (warn) this.warn = warn;
		return Error("Unable to create. Check console for more.");
	}
	async addUnMute(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const unMute = await Infractions.create({
			caseID: uniqid("unmute--"),
			type: "UnMute",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (unMute) this.unMute = unMute;
		return Error("Unable to create. Check console for more.");
	}
	async addMute(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const mute = await Infractions.create({
			caseID: uniqid("mute--"),
			type: "mute",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (mute) this.mute = mute;
		return Error("Unable to create. Check console for more.");
	}
	async addConvertMute(
		moderatorId: string,
		target: string,
		reason: string
	): Promise<Infractions | Error> {
		const convertMute = await Infractions.create({
			caseID: uniqid("convertmute--"),
			type: "ConvertMute",
			targetID: target,
			modID: moderatorId,
			reason: reason,
		}).catch((error) => console.log(error));
		if (convertMute) this.convertMute = convertMute;
		return Error("Unable to create. Check console for more.");
	}
}

export { Infraction };

/** @format */

import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize("database", "user", "pass", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	typeValidation: true,
	storage: "PYLDB.sqlite",
});

class Tags extends Model {
	declare tagName: string;
	declare tagPerms: number;
	declare tagReply: string;
	declare tagAuthor: string;
}
Tags.init(
	{
		tagName: {
			type: DataTypes.STRING(255),
			primaryKey: true,
		},
		tagPerms: DataTypes.SMALLINT,
		tagReply: DataTypes.STRING,
		tagAuthor: DataTypes.STRING,
	},
	{
		sequelize,
		modelName: "Tags",
	}
);

class Infractions extends Model {
	public get caseId(): string {
		return this.getDataValue("caseID");
	}
	public get targetId(): string {
		return this.getDataValue("targetID");
	}
	public get type(): string {
		return this.getDataValue("type");
	}
	public get modId(): string {
		return this.getDataValue("modID");
	}
	public get reason(): string {
		return this.getDataValue("reason");
	}
	public get duration(): string {
		return this.getDataValue("duration");
	}
	public get createdAt(): Date {
		return this.getDataValue("createdAt");
	}
	public get updatedAt(): Date {
		return this.getDataValue("updatedAt");
	}
	public get durationTimestamp(): string {
		return String(Math.trunc(parseInt(this.getDataValue("duration")) / 1000));
	}
}

Infractions.init(
	{
		caseID: {
			type: DataTypes.STRING(255),
			primaryKey: true,
		},
		type: DataTypes.TEXT,
		targetID: DataTypes.TEXT,
		modID: DataTypes.TEXT,
		reason: DataTypes.STRING,
		duration: DataTypes.TEXT,
	},
	{
		sequelize,
		tableName: "Infractions",
	}
);

class Prefix extends Model {
	public get prefix(): { type: string; value: string } {
		return {
			type: this.getDataValue("type"),
			value: this.getDataValue("value"),
		};
	}
	async getPrefix(
		type: "command" | "tag"
	): Promise<{ type: string; value: string } | null> {
		return (await Prefix.findByPk(type))?.prefix ?? null;
	}
}

Prefix.init(
	{
		type: {
			type: DataTypes.STRING(10),
			primaryKey: true,
		},
		prefix: {
			type: DataTypes.STRING(2),
			unique: true,
		},
	},
	{
		sequelize,
		tableName: "Prefix",
	}
);

Tags.sync().catch((error) => {
	console.error(error);
});
Infractions.sync().catch((error) => {
	console.error(error);
});
Prefix.sync().catch((error) => {
	console.error(error);
});

export { Tags, Infractions, Prefix };

/** @format */

import { Sequelize, DataTypes, Model } from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();

if (
	!process.env.DBNAME ||
	!process.env.DBUSERNAME ||
	!process.env.DBPASSWORD ||
	!process.env.DBHOST ||
	!process.env.DBPORT
)
	throw new Error("Required env variables not found.");

const sequelize = new Sequelize(
	process.env.DBNAME,
	process.env.DBUSERNAME,
	process.env.DBPASSWORD,
	{
		host: process.env.DBHOST,
		port: Number(process.env.DBPORT),
		dialect: "mariadb",
		logging: false,
		typeValidation: true,
		pool: {
			max: 10,
			min: 1,
			acquire: 300_000,
			idle: 900_000,
		},
	}
);

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
	declare caseID: string;
	declare type: string;
	declare targetID: String;
	declare modID: string;
	declare reason: string;
	declare duration: string;
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
	declare type: string;
	declare prefix: string;
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

try {
	Tags.sync().catch((error) => {
		console.error(error);
	});
	Infractions.sync().catch((error) => {
		console.error(error);
	});
	Prefix.sync().catch((error) => {
		console.error(error);
	});
} catch (e) {
	console.error(e);
}

export { Tags, Infractions, Prefix };

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY2MjgyODYyNH0.RnTVhZL9YNE_rtVQAGiDH36QJ_Y89NkJAbCI59OclyI
'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class user extends Model {
		static associate(models) {
			// define association here
		}

	}
	user.init({
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		device_token: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		sequelize,
		modelName: 'users',
	});
	return user;
};
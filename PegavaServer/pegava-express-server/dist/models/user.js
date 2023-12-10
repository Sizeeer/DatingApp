"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = __importDefault(require("sequelize"));
// Database connection instance
let databaseInstance = new db_1.default().database;
// Sequelize Model
exports.User = databaseInstance.define("User", {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    lastname: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    age: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});
//# sourceMappingURL=user.js.map
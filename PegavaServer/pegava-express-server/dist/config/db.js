"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class Database {
    db;
    user;
    password;
    host;
    port;
    maxPool;
    minPool;
    database;
    constructor() {
        this.db = process.env.DB_NAME || 'db_name';
        this.user = process.env.DB_USER || 'db_user';
        this.password = process.env.DB_PASS || 'db_pass';
        this.host = process.env.DB_HOST || 'db_host';
        this.port = Number(process.env.DB_PORT) || 1433;
        this.maxPool = Number(process.env.MAX_POOL) || 10;
        this.minPool = Number(process.env.MIN_POOL) || 1;
        this.database = new sequelize_1.default(this.db, this.user, this.password, {
            host: this.host,
            dialect: 'mssql',
            dialectOptions: {
                encrypt: true
            },
            port: this.port,
            logging: false,
            operatorsAliases: false,
            pool: {
                max: this.maxPool,
                min: this.minPool,
                acquire: 30000,
                idle: 10000
            }
        });
        this.database.authenticate()
            .then(() => {
            console.log('Connection has been established successfully.');
        })
            .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
        this.database.sync({
        // Using 'force' will drop any table defined in the models and create them again.
        // force: true
        });
    }
}
exports.default = Database;
//# sourceMappingURL=db.js.map
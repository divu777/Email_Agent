"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
class Database {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getClient() {
        return this.prisma;
    }
}
exports.db = Database.getInstance().getClient();

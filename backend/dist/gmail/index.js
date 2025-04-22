"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gmailobj = void 0;
const googleapis_1 = require("googleapis");
const config_1 = __importDefault(require("../config"));
const db_1 = require("../db");
class Gmail {
    constructor() {
        this.SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
        this.state = "";
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(config_1.default.CLIENT_ID, config_1.default.CLIENT_SECRET, config_1.default.REDIRECT_URL);
    }
    getAuthorizationURl(userId) {
        this.state = JSON.stringify({ userId });
        this.state = Buffer.from(this.state).toString("base64");
        console.log(this.state + "this is state and user id  " + userId);
        return this.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: this.SCOPES,
            prompt: "consent",
            include_grant_scopes: true,
            state: this.state,
        });
    }
    setTokens(q, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!q.code)
                    throw new Error("Authorization code is missing.");
                const { tokens } = yield this.oauth2Client.getToken(q.code);
                const { access_token, refresh_token, expiry_date } = tokens;
                this.oauth2Client.setCredentials(tokens);
                yield db_1.db.oAuth.create({
                    data: {
                        userId,
                        access_token,
                        refresh_token,
                        expiry_date: new Date(expiry_date),
                    },
                });
                this.gmail = googleapis_1.google.gmail({ version: "v1", auth: this.oauth2Client });
                console.log("Tokens set successfully:", tokens);
            }
            catch (error) {
                console.error("Error setting tokens:", error);
            }
        });
    }
    check_expiry(tokens, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.oauth2Client.setCredentials(tokens);
                if (!tokens.expiry_date || tokens.expiry_date < Date.now()) {
                    console.log("Token expired, refreshing...");
                    const { res } = yield this.oauth2Client.getAccessToken();
                    yield db_1.db.oAuth.update({
                        where: {
                            userId
                        },
                        data: {
                            access_token: res.data.access_token,
                            refresh_token: res.data.refresh_token,
                            expiry_date: new Date(res.data.expiry_date),
                        }
                    });
                    console.log("New tokens after refresh:" + res.data);
                }
                else {
                    console.log("Tokens are still valid.");
                }
            }
            catch (error) {
                console.error("Error checking token expiry:", error);
            }
        });
    }
}
exports.gmailobj = new Gmail();

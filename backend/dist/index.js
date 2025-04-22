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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gmail_1 = require("./gmail");
const gmailRoute_1 = __importDefault(require("./routes/gmailRoute"));
const process_1 = __importDefault(require("process"));
const http_1 = require("http");
const socket_1 = require("./socket");
const config_1 = __importDefault(require("./config"));
const analyticRoute_1 = __importDefault(require("./routes/analyticRoute"));
const promptRoute_1 = __importDefault(require("./routes/promptRoute"));
const app = (0, express_1.default)();
const app2 = (0, express_1.default)();
const server = (0, http_1.createServer)(app2);
(0, socket_1.IOinit)(server);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/analytics", analyticRoute_1.default);
app.use("/api/v1/prompt", promptRoute_1.default);
app.use("/api/v1/mail", gmailRoute_1.default);
app.get("/", (req, res) => {
    res.send("hello email agent boiss :)");
});
app.post("/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state, code } = req.body;
        if (!state || !code) {
            return res.status(400).json({
                message: "State and code are required",
                success: false,
            });
        }
        if (state !== gmail_1.gmailobj.state) {
            return res.status(403).json({
                message: "State mismatch — possible CSRF attack",
                success: false,
            });
        }
        const decoded = JSON.parse(Buffer.from(state, "base64").toString());
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        if (!userId) {
            return res.status(400).json({
                message: "Invalid state parameter",
                success: false,
            });
        }
        yield gmail_1.gmailobj.setTokens({ state, code }, userId);
        return res.status(200).json({
            message: "OAuth entry made successfully for the user",
            success: true,
        });
    }
    catch (err) {
        console.error("OAuth callback error:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
}));
app.listen(config_1.default.PORT, () => {
    console.log(`app is running on port ${process_1.default.env.PORT}`);
});

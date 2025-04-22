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
const db_1 = require("../db");
const prompts_1 = require("../genai/prompts/prompts");
const router = express_1.default.Router();
router.post("/setprompt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, prompt } = req.body;
        console.table([userId, prompt]);
        const result = yield db_1.db.oAuth.update({
            where: {
                userId
            },
            data: {
                prompt,
                onboarding_complete: true
            }
        });
        if (!result) {
            return res.status(200).json({
                message: "Could Not update userId",
                data: false
            });
        }
        return res.status(200).json({
            message: "Added prompt choice for the user, Onboarding complete",
            data: result
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "error in setting the prompt for the userId"
        });
    }
}));
router.get("/getPrompts", (req, res) => {
    try {
        const result = prompts_1.prompts;
        if (!result) {
            return res.status(200).json({
                message: "error in getting the prompts",
                success: false,
                status: 200
            });
        }
        return res.status(200).json({
            message: "Prompts fetched Successfully",
            success: true,
            data: result
        });
    }
    catch (error) {
        console.log("Error in getting all the Prompts");
        return res.json({
            message: "error in getting all the prompts",
            success: false
        });
    }
});
router.get("/getPrompts/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield db_1.db.oAuth.findUnique({
            where: {
                userId
            }
        });
        if (!result) {
            return res.status(200).json({
                message: "No Prompt found for this User"
            });
        }
        if (result && result.prompt) {
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error in getting the Prompt",
        });
    }
}));
exports.default = router;

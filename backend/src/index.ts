import e from "express";
import cors from "cors";
import { gmailobj } from "./gmail";
import mailRoutes from "./routes/gmailRoute";
import process from "process";
import { createServer } from "http";
import { IOinit } from "./socket";
import config from "./config";
import analyticRoute from "./routes/analyticRoute"
import promptRoute from "./routes/promptRoute"


const app = e();


const server =createServer(app);

IOinit(server);

app.use(cors());
app.use(e.json());

app.use("/api/v1/analytics",analyticRoute)
app.use("/api/v1/prompt", promptRoute)
app.use("/api/v1/mail", mailRoutes);

app.get("/", (req, res) => {
  res.send("hello email agent boiss :)");
});

app.post("/callback", async (req, res) => {
  try {
    const { state, code } = req.body;

    if (!state || !code) {
      return res.status(400).json({
        message: "State and code are required",
        success: false,
      });
    }

    if (state !== gmailobj.state) {
      return res.status(403).json({
        message: "State mismatch — possible CSRF attack",
        success: false,
      });
    }

    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    const userId = decoded?.userId;

    if (!userId) {
      return res.status(400).json({
        message: "Invalid state parameter",
        success: false,
      });
    }

    await gmailobj.setTokens({ state, code }, userId);

    return res.status(200).json({
      message: "OAuth entry made successfully for the user",
      success: true,
    });

  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
});



server.listen(config.PORT, () => {
  console.log(`Server (HTTP + WebSocket) running on port ${config.PORT}`);
});



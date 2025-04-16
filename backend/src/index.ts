import e from "express";
import cors from "cors";
import url from "url";
import { gmailobj } from "./gmail";
import mailRoutes from "./routes/gmailRoute";
import process from "process";
import { createServer } from "http";
import { IOinit } from "./socket";
import config from "./config";
import analyticRoute from "./routes/analyticRoute"
import promptRoute from "./routes/promptRoute"


const app = e();


const app2=e();
const server =createServer(app2);

IOinit(server);

app.use(cors());
app.use(e.json());

app.use("/api/v1/analytics",analyticRoute)
app.use("/api/v1/prompt", promptRoute)
app.use("/api/v1/mail", mailRoutes);

app.get("/", (req, res) => {
  res.send("hello email agent boiss :)");
});

app.get("/callback", async (req, res) => {
  try {
    let q = url.parse(req.url, true).query;
    if (q.error) {
      console.log("Error: " + q.error);
    } else if (q.state !== gmailobj.state) {
      console.log("State is mismatch possible CSRF Attack");
      res.end("State mismatch hackers hai");
    } else {
      const { userId } = JSON.parse(
        Buffer.from(q.state as string, "base64").toString()
      );
      

      if (!userId) {
        res.status(400).json({ error: "Invalid state parameter" });
      }
      await gmailobj.setTokens(q, userId);
      res.redirect(config.FRONTEND_URL?? "http://localhost:5173");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`app is running on port ${process.env.PORT}`);
});


/*
TODO FOR TOMORROW 10TH APRIL 

1) IN DB CHANGE PROMPT TO ENUM TYPES TO BE CASUAL PROFESSIONAL AND FUN , WHAT WE WILL DO IS SIMPLE 
WHEN LOADING THE PROMPT WE GET IT FROM THE PROMPTS FILE AND LOAD IT FROM THERE AND MAYBE FOR NOW JUST GIVE UK 3 OPTIONS 
AND NO CUSTOM PROMPT FOR NOW 

ALSO WORK ON THE ROUTES , /SETPROMPT , /GETPROMPT ( SHOW IN UI IN THE PROMPT PAGE ) , no need for custom for now 

2) TEST THE FLOW WITH DIFFERENT CASES WITH PROMPT CHANGE AND ONBOARIND KEY IF IT WORKS 

3) SET UP ANALYTICS PAGE AND ROUTES 

4 ) clean up and check for all possible routes with better messages and error handling 

// next week we can start UI design , till then open source 

*/
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Email Agent",
  version: "1.0.0",
  capabilities:{
    resources:{},
    tools:{}
  }
}
);



const getReply = ()=>{

}


server.tool(
  "get-reply",
  "Get reply for this gmail thread",
  {
    input: z.string()
  },
  async({input})=>{
    return{
      content:[
       { type:"text",
        text: "how are you divakar"}
      ]
    }
  }
)



async function main(){
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("mcp server connected ")

}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
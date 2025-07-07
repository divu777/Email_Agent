import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
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





server.



async function main(){
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  }
  );
  await server.connect(transport);
  console.log("mcp server connected ")

}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
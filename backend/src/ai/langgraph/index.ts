import { StateAnnotation } from '../../types/index';
import { ChatOpenAI } from "@langchain/openai";
import { END, START, StateGraph} from "@langchain/langgraph"
import {AIMessage} from "@langchain/core/messages"
const llm = new ChatOpenAI({
    model:'gpt-4.1',
    apiKey:process.env.OPENAI_API_KEY
})


console.log(JSON.stringify(StateAnnotation)+"==========>")
const llmNode = async(state:typeof StateAnnotation.State)=>{
    const response = await llm.invoke(state.messages)

    return {
        messages:[response]
    }
}

const user_query="hello"

const graph_builder = new StateGraph(StateAnnotation).addNode("chat_node",llmNode)
graph_builder.addEdge(START,"chat_node")
graph_builder.addEdge("chat_node",END)


export const graph = graph_builder.compile()

// const response =await graph.stream({
//     user_query:"hello how are you",
//     messages:[{"role":"user","content":user_query}]
// })

// console.log(response)

for await( const chunk of await graph.stream(
    {
    user_query:"hello how are you",
    messages:[{"role":"user","content":user_query}]
},{streamMode:'values'}
)){
    chunk.messages[chunk.messages.length-1]?.getType()=='ai' ?console.log("yayy"):console.log("nooo")
        console.log(chunk.messages[chunk.messages.length-1])

    console.log("\n====\n");

}
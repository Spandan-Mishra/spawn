import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getOnChainTools } from "../tools/factory";
import { AIMessage } from "@langchain/core/messages";

export default async function createAgentGraph({
    projectId,
    model,
}: {
    projectId: string;
    model: ChatGoogleGenerativeAI
}) {
    const tools = await getOnChainTools({ projectId });

    const modelWithTools = model.bindTools(tools);

    const agentNode = async (state: typeof MessagesAnnotation.State) => {
        const response = await modelWithTools.invoke(state.messages);

        return { messages: [response] };
    }

    const toolNode = new ToolNode(tools);

    const shouldContinue = (state: typeof MessagesAnnotation.State) => {
        const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

        if(lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools";
        } else {
            return "__end__";
        }
    }

    const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

    return workflow.compile();
}
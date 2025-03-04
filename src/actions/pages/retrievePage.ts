import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    composeContext,
    elizaLogger,
    generateObjectDeprecated,
} from "@elizaos/core";
import { sendNotionGetRequest } from "../action";
import { retrievePageTemplate } from "../../templates";

interface IPageParams {
    id: string;
}

const buildPageParams = async (
    state: State,
    runtime: IAgentRuntime
): Promise<IPageParams> => {
    const retrievePageContext = composeContext({
        state,
        template: retrievePageTemplate,
    });

    const pageParams = (await generateObjectDeprecated({
        runtime,
        context: retrievePageContext,
        modelClass: ModelClass.LARGE,
    })) as IPageParams;

    if (!pageParams.id) {
        throw new Error("Page id not provided");
    }

    return pageParams;
};

export const retrievePage: Action = {
    name: "RETRIEVE_PAGE",
    description: "Action to retrieve a Notion page",
    similes: ["LIST_PAGE", "GET_PAGE", "FETCH_PAGE"],
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you retrieve a Notion page with ID 1234",
                    action: "RETRIEVE_PAGE",
                },
            },
            {
                user: "user",
                content: {
                    text: "Retrieve a page with id 1234",
                    action: "RETRIEVE_PAGE",
                },
            },
        ],
    ],
    suppressInitialMessage: true,
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { page_id?: string },
        callback: HandlerCallback
    ) => {
        const apiKey = runtime.getSetting("NOTION_API_KEY");
        const pageParams = await buildPageParams(state, runtime);

        elizaLogger.info(`Page id from params is: ${pageParams.id}`);
    },
    validate: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State
    ) => {
        return (
            !!runtime.getSetting("NOTION_API_KEY") &&
            !!buildPageParams(state, runtime)
        );
    },
};

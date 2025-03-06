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
} from '@elizaos/core';
import { createPageTemplate } from '../../templates';
import { sendNotionGetRequest } from '../action';
import { NotionPageResponse } from '../../interfaces/NotionPage';

interface NotionPageParams {
  id: string;
  title: string;
}

// TODO: Add implementation for database parent
// interface DatabaseParent {
//   database_id: string;
// }

interface TextContent {
  content: string;
}

interface TitleProperty {
  text: TextContent;
}

interface Properties {
  title: TitleProperty[];
}

interface Parent {
  type: string;
  page_id: string;
}

interface NotionPagePayload {
  parent: Parent;
  properties: Properties;
}

export const createPage: Action = {
  name: 'CREATE_PAGE',
  description: 'Action to create a Notion page inside of the existing page',
  similes: ['BUILD_PAGE'],
  examples: [
    [
      {
        user: 'assistant',
        content: {
          text: "I'll help you create a Notion page with ID 1234",
          action: 'CREATE_PAGE',
        },
      },
      {
        user: 'user',
        content: {
          text: 'Create a notion page inside of the existing page with id 1234',
          action: 'CREATE_PAGE',
        },
      },
    ],
  ],
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { page_id?: string },
    callback: HandlerCallback
  ) => {
    const params = await buildPageParams(state, runtime);

    elizaLogger.info(`Id is: ${params.id}`);
    elizaLogger.info(`Title is: ${params.title}`);
  },
  validate: async (runtime: IAgentRuntime, _message: Memory, state: State) => {
    return !!runtime.getSetting('NOTION_API_KEY');
  },
};

const buildPageParams = async (
  state: State,
  runtime: IAgentRuntime
): Promise<NotionPageParams> => {
  const createPageContext = composeContext({
    state,
    template: createPageTemplate,
  });

  const pageParams = (await generateObjectDeprecated({
    runtime,
    context: createPageContext,
    modelClass: ModelClass.LARGE,
  })) as NotionPageParams;

  if (!pageParams.id && !pageParams.title) {
    throw new Error('Page id not provided');
  }

  return pageParams;
};

const buildPayload = () => {};

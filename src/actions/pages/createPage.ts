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
import { createPageTemplate } from '../../templates/index';
import { sendNotionPostRequest } from '../action';
import { NotionPageResponse } from '../../interfaces/NotionPage';

interface NotionPageParams {
  id: string;
  title: string;
}

export const createPage: Action = {
  name: 'CREATE_PAGE',
  description: 'Action to create a Notion page inside of the existing page',
  similes: ['BUILD_PAGE', 'DEFINE_PAGE'],
  suppressInitialMessage: true,
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
    const apiKey = runtime.getSetting('NOTION_API_KEY');
    const params = await buildPageParams(state, runtime);

    if (!params) {
      elizaLogger.error(`Both title and parent page id should be present`);
      return false;
    }

    const payload = buildPayload(params.id, params.title);
    const page = createNotionPage(apiKey, payload);

    if (!page) {
      callback({
        text: 'Unable to create a new page',
      });
      return false;
    }

    callback({
      text: 'New page is successfully created',
    });

    return true;
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

  if (pageParams.id == null || pageParams.title == null) {
    return null;
  }

  return pageParams;
};

export const createNotionPage = async (
  apiKey: string,
  payload: Object
): Promise<NotionPageResponse> => {
  try {
    const response = await sendNotionPostRequest<NotionPageResponse>(
      apiKey,
      '/pages',
      payload
    );

    return response;
  } catch (error) {
    elizaLogger.error(`Error when fetching Notion page: ${error}`);
    return null;
  }
};

export const buildPayload = (page_id: string, title: string): Object => {
  return {
    parent: {
      type: 'page_id',
      page_id: page_id,
    },
    properties: {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    },
  };
};

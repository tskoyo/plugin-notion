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
import { retrievePageTemplate } from '../../templates';
import { sendNotionGetRequest } from '../action';
import { NotionPageResponse } from '../../interfaces/notionPage';

interface INotionPage {
  id: string;
}

const buildPageParams = async (
  state: State,
  runtime: IAgentRuntime
): Promise<INotionPage> => {
  const retrievePageContext = composeContext({
    state,
    template: retrievePageTemplate,
  });

  const pageParams = (await generateObjectDeprecated({
    runtime,
    context: retrievePageContext,
    modelClass: ModelClass.LARGE,
  })) as INotionPage;

  if (!pageParams.id) {
    throw new Error('Page id not provided');
  }

  return pageParams;
};

export const retrievePage: Action = {
  name: 'RETRIEVE_PAGE',
  description: 'Action to retrieve a Notion page',
  similes: ['LIST_PAGE', 'GET_PAGE', 'FETCH_PAGE'],
  examples: [
    [
      {
        user: 'assistant',
        content: {
          text: "I'll help you retrieve a Notion page with ID 1234",
          action: 'RETRIEVE_PAGE',
        },
      },
      {
        user: 'user',
        content: {
          text: 'Retrieve a page with id 1234',
          action: 'RETRIEVE_PAGE',
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
    const apiKey = runtime.getSetting('NOTION_API_KEY');
    const pageParams = await buildPageParams(state, runtime);

    const page = await getNotionPage(apiKey, pageParams.id);

    if (!page) {
      callback({
        text: `The page with id ${pageParams.id} was not found`,
      });

      return false;
    }

    const agentMessage = buildPageInfoMessage(page);

    callback({
      text: agentMessage,
    });
    return true;
  },
  validate: async (runtime: IAgentRuntime, _message: Memory, state: State) => {
    return (
      !!runtime.getSetting('NOTION_API_KEY') &&
      !!buildPageParams(state, runtime)
    );
  },
};

const getNotionPage = async (
  apiKey: string,
  id: string
): Promise<NotionPageResponse> => {
  try {
    const response = await sendNotionGetRequest<NotionPageResponse>(
      apiKey,
      `/pages/${id}`
    );

    return response;
  } catch (error) {
    elizaLogger.error(`Error when fetching Notion page: ${error}`);
    return null;
  }
};

const buildPageInfoMessage = (page: NotionPageResponse): string => {
  const pageTitle = page.properties.title.title[0].plain_text;

  const createdTime = new Date(page.created_time).toLocaleString();
  const lastEditedTime = new Date(page.last_edited_time).toLocaleString();

  // Build the message
  let message = `📄 Page Title: ${pageTitle}\n`;
  message += `🆔 Page ID: ${page.id}\n`;
  message += `📅 Created On: ${createdTime}\n`;
  message += `✏️ Last Edited On: ${lastEditedTime}\n`;
  message += `👤 Created By: ${page.created_by.id}\n`;
  message += `👤 Last Edited By: ${page.last_edited_by.id}\n`;
  message += `🔗 Notion URL: ${page.url}\n`;

  if (page.public_url) {
    message += `🌐 **Public URL:** ${page.public_url}\n`;
  }

  return message;
};

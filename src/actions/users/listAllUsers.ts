import {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
  elizaLogger,
} from '@elizaos/core';

import { sendNotionGetRequest, validateNotionApiKey } from '../action';
import { NotionUserListResponse } from '../../interfaces/NotionListResponse';
import { NotionUser } from '../../interfaces/NotionUser';

export const listAllUsers: Action = {
  name: 'LIST_ALL_USERS',
  description: 'Lists all users within the workspace',
  similes: ['FETCH_USERS', 'LIST_USERS', 'GET_ALL_USERS', 'RETRIEVE_ALL_USERS'],
  examples: [],
  suppressInitialMessage: true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback: HandlerCallback
  ) => {
    const apiKey = validateNotionApiKey();

    if (!apiKey) {
      elizaLogger.error('Invalid api key');
      return false;
    }

    const response = await getNotionUsers(apiKey);

    if (!response) {
      return false;
    }

    const users = response.map((user) => user.name).join(', ');

    callback({
      text: `Here are some users in your Notion workspace: ${users}`,
      content: users,
    });
    return true;
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting('NOTION_API_KEY');
  },
};

const getNotionUsers = async (apiKey: string): Promise<NotionUser[]> => {
  try {
    const response = await sendNotionGetRequest<NotionUserListResponse>(
      apiKey,
      '/users'
    );

    return response.results;
  } catch (error) {
    elizaLogger.error(`Error when fetching Notion users: ${error}`);
    return;
  }
};

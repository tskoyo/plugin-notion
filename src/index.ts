import type { Plugin } from '@elizaos/core';
import { listAllUsers } from './actions/users/listAllUsers';
import { retrievePage } from './actions/pages/retrievePage';

export const notionPlugin: Plugin = {
  name: 'notion',
  description: 'Notion plugin',
  actions: [listAllUsers, retrievePage],
};

import { it, expect, describe } from 'vitest';
import { createNotionPage } from '../actions/pages/createPage';

describe('Create page', () => {
  describe('invalid page id', () => {
    it('should not create page', async () => {
      const apiKey = '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';

      const pageId = '123';
      const title = 'Some dummy title';

      const payload = `
        {
            parent: {
                type: 'page_id',
                page_id: ${pageId},
                },
                properties: {
                title: [
                    {
                        text: {
                            content: ${title},
                        },
                    },
                ],
            },
        }
      `;

      const page = await createNotionPage(apiKey, payload);

      console.log(page);
      expect(page).toBe(null);
    }, 5000);
  });
});

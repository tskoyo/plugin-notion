import { it, expect, describe } from 'vitest';
import { buildPayload, createNotionPage } from '../actions/pages/createPage.ts';
import 'dotenv/config';

describe('Create page', () => {
  const apiKey = process.env.NOTION_API_KEY;
  const title = 'Some dummy title from test';

  describe('invalid page id', () => {
    it('should not create page', async () => {
      const pageId = '123';
      const payload = buildPayload(pageId, title);

      const page = await createNotionPage(apiKey, payload);

      expect(page).toBe(null);
    }, 5000);
  });

  describe('valid page id', () => {
    it('should create a new page', async () => {
      const pageId = '1aabd338-ff88-80ec-92ea-ce2e6857ba6c';
      const payload = buildPayload(pageId, title);

      const page = await createNotionPage(apiKey, payload);

      expect(page.parent.page_id).toEqual(pageId);
    });
  });
});

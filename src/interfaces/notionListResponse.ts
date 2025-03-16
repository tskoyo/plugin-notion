import { NotionUser } from './notionUser';

export interface NotionUserListResponse {
  object: 'list';
  results: NotionUser[];
  next_cursor: string | null;
  has_more: boolean;
  type: 'user';
  user: Record<string, unknown>; // Empty object in the response
  developer_survey: string;
  request_id: string;
}

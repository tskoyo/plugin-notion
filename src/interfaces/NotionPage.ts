import { NotionUser } from './NotionUser';

interface NotionParentPage {
  type: 'page_id';
  page_id: string;
}

interface NotionText {
  content: string;
  link: null | string;
}

interface NotionAnnotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

interface NotionRichText {
  type: 'text';
  text: NotionText;
  annotations: NotionAnnotations;
  plain_text: string;
  href: null | string;
}

interface NotionTitleProperty {
  id: string;
  type: 'title';
  title: NotionRichText[];
}

interface NotionProperties {
  title: NotionTitleProperty;
}

export interface NotionPageResponse {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  cover: null;
  icon: null;
  parent: NotionParentPage;
  archived: boolean;
  in_trash: boolean;
  properties: NotionProperties;
  url: string;
  public_url: null | string;
  developer_survey: string;
  request_id: string;
}

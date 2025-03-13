import axios, { AxiosRequestConfig } from 'axios';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const BASE_URL = 'https://api.notion.com';
const VERSION = '/v1';
const NOTION_VERSION = '2022-06-28';

export const validateNotionApiKey = (): string => {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('Notion API key not set');
  }

  return apiKey;
};

export const sendNotionGetRequest = async <T>(
  apiKey: string,
  urlPath: string
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      timeout: DEFAULT_TIMEOUT,
    };
    const url = BASE_URL + VERSION + urlPath;
    return (await axios.get<T>(url, config)).data;
  } catch (error) {
    throw error;
  }
};

export const sendNotionPostRequest = async <T>(
  apiKey: string,
  urlPath: string,
  payload: Object
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      timeout: DEFAULT_TIMEOUT,
    };
    const url = BASE_URL + VERSION + urlPath;
    return (await axios.post<T>(url, payload, config)).data;
  } catch (error) {
    throw error;
  }
};

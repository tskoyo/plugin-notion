// src/actions/users/listAllUsers.ts
import {
  elizaLogger
} from "@elizaos/core";

// src/actions/action.ts
import axios from "axios";
var DEFAULT_TIMEOUT = 3e4;
var BASE_URL = "https://api.notion.com";
var VERSION = "/v1";
var NOTION_VERSION = "2022-06-28";
function validateNotionApiKey() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error("Notion API key not set");
  }
  return apiKey;
}
async function sendNotionGetRequest(apiKey, urlPath) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      timeout: DEFAULT_TIMEOUT
    };
    const url = BASE_URL + VERSION + urlPath;
    return (await axios.get(url, config)).data;
  } catch (error) {
    throw error;
  }
}
async function sendNotionPostRequest(apiKey, urlPath, payload) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      timeout: DEFAULT_TIMEOUT
    };
    const url = BASE_URL + VERSION + urlPath;
    return (await axios.post(url, payload, config)).data;
  } catch (error) {
    throw error;
  }
}

// src/actions/users/listAllUsers.ts
var listAllUsers = {
  name: "LIST_ALL_USERS",
  description: "Lists all users within the workspace",
  similes: ["FETCH_USERS", "LIST_USERS", "GET_ALL_USERS", "RETRIEVE_ALL_USERS"],
  examples: [],
  suppressInitialMessage: true,
  handler: async (runtime, message, state, _options, callback) => {
    const apiKey = validateNotionApiKey();
    if (!apiKey) {
      elizaLogger.error("Invalid api key");
      return false;
    }
    const response = await getNotionUsers(apiKey);
    if (!response) {
      return false;
    }
    const users = response.map((user) => user.name).join(", ");
    callback({
      text: `Here are some users in your Notion workspace: ${users}`,
      content: users
    });
    return true;
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("NOTION_API_KEY");
  }
};
var getNotionUsers = async (apiKey) => {
  try {
    const response = await sendNotionGetRequest(
      apiKey,
      "/users"
    );
    return response.results;
  } catch (error) {
    elizaLogger.error(`Error when fetching Notion users: ${error}`);
    return;
  }
};

// src/actions/pages/retrievePage.ts
import {
  ModelClass,
  composeContext,
  elizaLogger as elizaLogger2,
  generateObjectDeprecated
} from "@elizaos/core";

// src/templates/index.ts
var retrievePageTemplate = `Given the recent messages and page information below:

{{recentMessages}}

Extract the following information about the requested page:

- Id of the page

You MUST respond with ONLY a JSON block and nothing else. Do NOT include any explanations, commentary, or text outside the JSON block.

\`\`\`json
{
    "id": string | null
}
\`\`\`
`;
var createPageTemplate = `Given the recent messages and page information below:

{{recentMessages}}

Extract the following information about the requested page:

- Id of the page
- Title of the page

You MUST respond with ONLY a JSON block and nothing else. Do NOT include any explanations, commentary, or text outside the JSON block.

\`\`\`json
{
    "id": string | null
    "title": string | null
}
\`\`\`
`;

// src/actions/pages/retrievePage.ts
var buildPageParams = async (state, runtime) => {
  const retrievePageContext = composeContext({
    state,
    template: retrievePageTemplate
  });
  const pageParams = await generateObjectDeprecated({
    runtime,
    context: retrievePageContext,
    modelClass: ModelClass.LARGE
  });
  if (!pageParams.id) {
    throw new Error("Page id not provided");
  }
  return pageParams;
};
var retrievePage = {
  name: "RETRIEVE_PAGE",
  description: "Action to retrieve a Notion page",
  similes: ["LIST_PAGE", "GET_PAGE", "FETCH_PAGE"],
  examples: [
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you retrieve a Notion page with ID 1234",
          action: "RETRIEVE_PAGE"
        }
      },
      {
        user: "user",
        content: {
          text: "Retrieve a page with id 1234",
          action: "RETRIEVE_PAGE"
        }
      }
    ]
  ],
  suppressInitialMessage: true,
  handler: async (runtime, message, state, _options, callback) => {
    const apiKey = runtime.getSetting("NOTION_API_KEY");
    const pageParams = await buildPageParams(state, runtime);
    const page = await getNotionPage(apiKey, pageParams.id);
    if (!page) {
      callback({
        text: `The page with id ${pageParams.id} was not found`
      });
      return false;
    }
    const agentMessage = buildPageInfoMessage(page);
    callback({
      text: agentMessage
    });
    return true;
  },
  validate: async (runtime, _message, state) => {
    return !!runtime.getSetting("NOTION_API_KEY") && !!buildPageParams(state, runtime);
  }
};
var getNotionPage = async (apiKey, id) => {
  try {
    const response = await sendNotionGetRequest(
      apiKey,
      `/pages/${id}`
    );
    return response;
  } catch (error) {
    elizaLogger2.error(`Error when fetching Notion page: ${error}`);
    return null;
  }
};
var buildPageInfoMessage = (page) => {
  const pageTitle = page.properties.title.title[0].plain_text;
  const createdTime = new Date(page.created_time).toLocaleString();
  const lastEditedTime = new Date(page.last_edited_time).toLocaleString();
  let message = `\u{1F4C4} Page Title: ${pageTitle}
`;
  message += `\u{1F194} Page ID: ${page.id}
`;
  message += `\u{1F4C5} Created On: ${createdTime}
`;
  message += `\u270F\uFE0F Last Edited On: ${lastEditedTime}
`;
  message += `\u{1F464} Created By: ${page.created_by.id}
`;
  message += `\u{1F464} Last Edited By: ${page.last_edited_by.id}
`;
  message += `\u{1F517} Notion URL: ${page.url}
`;
  if (page.public_url) {
    message += `\u{1F310} **Public URL:** ${page.public_url}
`;
  }
  return message;
};

// src/actions/pages/createPage.ts
import {
  ModelClass as ModelClass2,
  composeContext as composeContext2,
  elizaLogger as elizaLogger3,
  generateObjectDeprecated as generateObjectDeprecated2
} from "@elizaos/core";
var createPage = {
  name: "CREATE_PAGE",
  description: "Action to create a Notion page inside of the existing page",
  similes: ["BUILD_PAGE", "DEFINE_PAGE"],
  suppressInitialMessage: true,
  examples: [
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you create a Notion page with ID 1234",
          action: "CREATE_PAGE"
        }
      },
      {
        user: "user",
        content: {
          text: "Create a notion page inside of the existing page with id 1234",
          action: "CREATE_PAGE"
        }
      }
    ]
  ],
  handler: async (runtime, message, state, _options, callback) => {
    const apiKey = runtime.getSetting("NOTION_API_KEY");
    const params = await buildPageParams2(state, runtime);
    elizaLogger3.info(`Id is: ${params.id}`);
    elizaLogger3.info(`Title is: ${params.title}`);
    const payload = buildPayload(params.id, params.title);
    const page = createNotionPage(apiKey, payload);
    if (!page) {
      callback({
        text: "Unable to create a new page"
      });
      return false;
    }
    callback({
      text: "New page is successfully created"
    });
    return true;
  },
  validate: async (runtime, _message, state) => {
    return !!runtime.getSetting("NOTION_API_KEY");
  }
};
var buildPageParams2 = async (state, runtime) => {
  const createPageContext = composeContext2({
    state,
    template: createPageTemplate
  });
  const pageParams = await generateObjectDeprecated2({
    runtime,
    context: createPageContext,
    modelClass: ModelClass2.LARGE
  });
  if (!pageParams.id && !pageParams.title) {
    throw new Error("Page id not provided");
  }
  return pageParams;
};
var createNotionPage = async (apiKey, payload) => {
  try {
    const response = await sendNotionPostRequest(
      apiKey,
      "/pages",
      payload
    );
    return response;
  } catch (error) {
    elizaLogger3.error(`Error when fetching Notion page: ${error}`);
    return null;
  }
};
var buildPayload = (page_id, title) => {
  return {
    parent: {
      type: "page_id",
      page_id
    },
    properties: {
      title: [
        {
          text: {
            content: title
          }
        }
      ]
    }
  };
};

// src/index.ts
var notionPlugin = {
  name: "notion",
  description: "Notion plugin",
  actions: [listAllUsers, retrievePage, createPage]
};
export {
  notionPlugin
};

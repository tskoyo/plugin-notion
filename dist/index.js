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
    return error;
  }
}

// src/actions/users/listAllUsers.ts
var listAllUsers = {
  name: "LIST_ALL_USERS",
  description: "Lists all users within the workspace",
  similes: [
    "FETCH_USERS",
    "LIST_USERS",
    "GET_ALL_USERS",
    "RETRIEVE_ALL_USERS"
  ],
  examples: [],
  suppressInitialMessage: true,
  handler: async (runtime, message, state, _options, callback) => {
    const apiKey = validateNotionApiKey();
    if (!apiKey) {
      elizaLogger.error("Invalid api key");
      return;
    }
    const response = await sendNotionGetRequest(apiKey, "/users");
    const users = response.results.map((user) => user.name).join(", ");
    callback({
      text: `Here are the users in your Notion workspace: ${users}`,
      content: users
    });
    return true;
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("NOTION_API_KEY");
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

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "id": string | null
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
    elizaLogger2.info(`Page id from params is: ${pageParams.id}`);
  },
  validate: async (runtime, _message, state) => {
    return !!runtime.getSetting("NOTION_API_KEY") && !!buildPageParams(state, runtime);
  }
};

// src/index.ts
var notionPlugin = {
  name: "notion",
  description: "Notion plugin",
  actions: [listAllUsers, retrievePage]
};
export {
  notionPlugin
};

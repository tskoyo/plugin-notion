export const retrievePageTemplate = `Given the recent messages and page information below:

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

export const createPageTemplate = `Given the recent messages and page information below:

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

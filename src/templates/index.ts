export const retrievePageTemplate = `Given the recent messages and page information below:

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

# @elizaos/plugin-notion

A plugin for working with Notion.

## Description

Notion is a tool for taking notes, creating new pages and organising your work. With ElizaOS,
you can easily manage your workspace, create new pages, etc..

## Installation

```bash
pnpm install @elizaos/plugin-notion
```

## Configuration

The plugin requires the following environment variables to be set:

```typescript
NOTION_API_KEY;
```

The plugin requires a Notion API key to authenticate requests. You can obtain it from the Notion Developer Portal.

## Usage

### Basic Integration

```typescript
import { notionPlugin } from '@elizaos-plugins/plugin-notion';
```

### Create new page example

```typescript
Create a new page with title "Todo List"
```

## API Reference

### Actions

#### CREATE_PAGE

Creates a new page within the existing page.

**Aliases:**

- BUILD_PAGE
- DEFINE_PAGE

## Development Guide

### Setting Up Development Environment

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run the plugin:

```bash
pnpm run dev
```

5. Run the project using your character:

```bash
pnpm start --character="characters/your-character.character.json"
```

## Future Enhancements

We plan to support additional Notion API endpoints in upcoming releases:

- **Users**
  - [ ] Retrieve a user (GET)
- **Databases**
  - [ ] Retrieve a database (GET)
  - [ ] Query a database (POST)
  - [ ] Sort a database (POST)
  - [ ] Filter a database (POST)
  - [ ] Create a database (POST)
  - [ ] Update a database (PATCH)
  - [ ] Update database properties (PATCH)
- **Pages**
  - [ ] Create a page within an existing page (POST)
  - [ ] Create a page with content (POST)
  - [ ] Retrieve a page (GET)
  - [ ] Update page properties (PATCH)
  - [ ] Archive a page (PATCH)
  - [ ] Retrieve a page property item (GET)
- **Blocks** (TBD)
- **Search**
  - [ ] Search (POST)
- **Comments** (TBD)

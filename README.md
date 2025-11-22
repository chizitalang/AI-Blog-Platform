# Zenith - AI-Powered Personal Blog Platform

Zenith is a modern, minimalist blog application built with React and Tailwind CSS. It is designed to act as a frontend for a FastAPI backend (simulated in this demo) and features a flat-file-based content management system where every blog post is a Markdown file.

Key features include an integrated Gemini AI writing assistant, real-time Markdown preview, syntax highlighting, and nested directory organization.

---

## 🏗️ Design Architecture

### 1. Frontend Framework
*   **React 19**: Utilizing functional components, Hooks (`useState`, `useEffect`, `useRef`), and standard React patterns.
*   **TypeScript**: Ensures type safety across data models (Blog Posts, Authors) and component props.
*   **Tailwind CSS**: Utility-first styling for a clean, responsive, and maintainable UI.
*   **Lucide React**: Modern, consistent iconography.

### 2. Data Model ("File-System" approach)
Instead of a traditional database, Zenith simulates a static site generator or flat-file CMS approach:
*   **Source of Truth**: Raw Markdown strings stored in a virtual file system dictionary.
*   **Metadata**: Stored as **YAML Frontmatter** at the top of each markdown file (e.g., `title`, `author`, `tags`, `publishedAt`).
*   **Virtual Storage**:
    *   `services/blogService.ts` maintains a `MOCK_FILE_SYSTEM` object.
    *   Keys are file paths (e.g., `blog/engineering/post.md`).
    *   Values are the full file content (Frontmatter + Body).
*   **Runtime Parsing**: The app parses Frontmatter on the fly to generate the post list and filters.

### 3. AI Integration (Gemini)
*   **Draft Generation**: Generates full blog posts based on a user-provided topic.
*   **Refinement**: Allows users to highlight or refine existing content (e.g., "Make this shorter", "Fix grammar") using a conversational prompt style.
*   **Configuration**: Requires a valid `API_KEY` environment variable for the Google GenAI SDK.

### 4. Components
*   **`App.tsx`**: The main orchestrator handling routing (View States: `HOME`, `ARTICLE`, `EDITOR`).
*   **`EditorPage`**: A rich markdown editor with split-screen preview, AI tools, file import/export, and draft saving.
*   **`HomePage`**: Displays posts in a grid, supports searching, and features a directory-tree sidebar for filtering by folder.
*   **`ArticlePage`**: Renders markdown content, highlights code syntax, and displays author profiles.
*   **`MarkdownView`**: A wrapper around `react-markdown` and `react-syntax-highlighter` to render polished content.

---

## 📖 Usage Guide

### 1. Navigation & Discovery
*   **Home Stream**: The landing page shows the latest articles.
*   **Search**: Use the search bar to filter articles by title, excerpt, or tags.
*   **Directory Tree**: The sidebar (desktop) or file path indicators show the folder structure (e.g., `blog/engineering`). Click a folder to filter posts within that specific category.

### 2. Reading Articles
*   Click any card to read the full article.
*   **Code Blocks**: Syntax highlighting is automatically applied to code snippets.
*   **Social Sharing**: Use the buttons in the header to share the post on Twitter, LinkedIn, or Facebook.
*   **Author Profile**: Scroll to the bottom to see details about the author.

### 3. Writing & Editing
*   Click **"Write Post"** in the navigation bar.
*   **Metadata**:
    *   **Title**: Enter a catchy headline.
    *   **Tags**: Comma-separated list (e.g., `React, AI, Tutorial`).
    *   **Path**: Define the folder structure (default is `blog`). You can use deep nesting like `blog/tech/web`.
*   **Content**: Write in standard Markdown.
    *   Use `#` for headers.
    *   Use ` ```language ` for code blocks.
*   **Preview**: Toggle the "Preview" tab to see how the post will look when published.

### 4. AI Copilot
Located in the sidebar or top bar of the Editor:
1.  **Generate Draft**: Enter a topic (e.g., "The benefits of TypeScript") and click **Generate**. The AI will write a structured initial draft.
2.  **Refine**: Once you have content, a "Refine" input appears. Type instructions like "Make the introduction funnier" or "Expand the conclusion" and click the magic wand icon.

### 5. File Management
*   **Save Draft**: Click "Save Draft" to persist your work to the browser's LocalStorage. If you close the tab and return, your work will be restored.
*   **Import**: Click the Upload icon to load a local `.md` file into the editor.
*   **Export**: Click the Download icon to save your current post as a `.md` file with valid Frontmatter, ready for a Git commit or static site generator.

---

## 🛠️ Technical Setup

### Installation
1.  Clone the repository.
2.  Install dependencies (if converting to a local Node project):
    ```bash
    npm install react react-dom lucide-react react-markdown react-syntax-highlighter @google/genai
    ```
3.  Set up the API Key:
    *   Create a `.env` file or export the variable in your shell.
    *   `export API_KEY="your_gemini_api_key"`

### Deployment
*   **GitHub Actions**: The user prompt suggests a GitHub Actions workflow. A typical workflow would build the React app and deploy the static artifacts to GitHub Pages, Netlify, or Vercel.
*   **Backend**: While this demo mocks the backend, in production, `services/blogService.ts` would be replaced with `fetch()` calls to a FastAPI Python server handling the `fs` operations or database queries.

---

## 🎨 Style Guide
*   **Colors**: Slate-50 to Slate-900 for comprehensive greyscale. Indigo-600 as the primary brand color.
*   **Typography**: `Inter` for UI elements, `Merriweather` for long-form article content (serif).
*   **Icons**: Consistent use of Lucide React icons (16px - 24px).
*   **Spacing**: Generous whitespace using Tailwind's `p-6`, `gap-8`, `mb-6` utilities.

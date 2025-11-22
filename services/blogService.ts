import { BlogPost, Author } from '../types';

// In a real application, these would be axios/fetch calls to your Python FastAPI backend.
// e.g., await fetch('https://api.yourblog.com/posts')

const MOCK_AUTHORS: Record<string, Author> = {
  'Alex Dev': {
    name: 'Alex Dev',
    role: 'Senior Python Engineer',
    bio: 'Alex loves building scalable backend systems and exploring new algorithms. When not coding, he is hiking.',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  'Sarah Ops': {
    name: 'Sarah Ops',
    role: 'DevOps Specialist',
    bio: 'Sarah is passionate about automation, CI/CD pipelines, and cloud infrastructure. She ensures code ships smoothly.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  'Jordan Lee': {
    name: 'Jordan Lee',
    role: 'AI Researcher',
    bio: 'Jordan focuses on the intersection of generative AI and software engineering, pushing the boundaries of what tools can do.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
};

// SIMULATING A FILE-BASED DATABASE WITH NESTED FOLDERS
// Keys represent the file path relative to project root
const MOCK_FILE_SYSTEM: Record<string, string> = {
  'blog/engineering/backend/building-scalable-apis-fastapi.md': `---
id: 1
title: Building Scalable APIs with Python FastAPI
slug: building-scalable-apis-fastapi
author: Alex Dev
publishedAt: 2023-10-15
tags: [Python, FastAPI, Backend]
coverImage: https://picsum.photos/800/400?random=1
excerpt: Explore why FastAPI is becoming the go-to framework for high-performance Python web services and how to leverage its async capabilities.
---

# Building Scalable APIs with Python FastAPI

FastAPI has taken the Python world by storm. It offers high performance, easy-to-learn syntax, and automatic interactive documentation.

## Why FastAPI?

1. **Speed**: It's on par with NodeJS and Go.
2. **Type Safety**: Leverages Python 3.6+ type hints.
3. **Async Support**: Built on Starlette and Pydantic.

## Code Example

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
\`\`\`

## Conclusion

If you are building data-intensive applications or ML wrappers, FastAPI is the way to go.`,

  'blog/engineering/devops/deploying-github-actions.md': `---
id: 2
title: Deploying to the Cloud with GitHub Actions
slug: deploying-github-actions
author: Sarah Ops
publishedAt: 2023-10-20
tags: [DevOps, CI/CD, GitHub]
coverImage: https://picsum.photos/800/400?random=2
excerpt: A step-by-step guide to automating your deployment pipeline using GitHub Actions CI/CD workflows.
---

# Deploying to the Cloud with GitHub Actions

Automation is key to modern DevOps. GitHub Actions allows you to build, test, and deploy your code right from GitHub.

## The Workflow File

Create a \`.yml\` file in \`.github/workflows/\`:

\`\`\`yaml
name: CI/CD

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run Scripts
      run: echo "Deploying..."
\`\`\`

This simple configuration can save hours of manual work.`,

  'blog/ai/research/future-ai-software.md': `---
id: 3
title: The Future of AI in Software Development
slug: future-ai-software
author: Jordan Lee
publishedAt: 2023-10-28
tags: [AI, Gemini, Future]
coverImage: https://picsum.photos/800/400?random=3
excerpt: How LLMs like Gemini are transforming the way we write, debug, and optimize code.
---

# The Future of AI in Software Development

Artificial Intelligence is no longer just a buzzword; it's a daily tool for developers.

## Key Areas of Impact

- **Code Generation**: Boilerplate is a thing of the past.
- **Debugging**: AI can spot race conditions humans miss.
- **Documentation**: Automated docs are becoming standard.

## Leveraging Gemini

Using the Gemini API, developers can integrate reasoning capabilities directly into their apps.`
};

// --- Helper: Simple Frontmatter Parser & Serializer ---

const parseFrontMatter = (fileContent: string): { metadata: Record<string, any>, body: string } => {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = fileContent.match(frontMatterRegex);
  
  if (!match) return { metadata: {}, body: fileContent };
  
  const metadata: Record<string, any> = {};
  const frontMatterLines = match[1].split('\n');
  
  frontMatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      value = value.replace(/^['"](.*)['"]$/, '$1');
      
      // Handle arrays like [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
         metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'));
      } else {
         metadata[key] = value;
      }
    }
  });
  
  return { metadata, body: fileContent.replace(frontMatterRegex, '') };
};

export const createFrontMatterString = (metadata: Record<string, any>, body: string): string => {
  const frontMatterLines = ['---'];
  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      frontMatterLines.push(`${key}: [${value.join(', ')}]`);
    } else {
      frontMatterLines.push(`${key}: ${value}`);
    }
  }
  frontMatterLines.push('---');
  frontMatterLines.push('');
  return frontMatterLines.join('\n') + body;
};

// --- Service Methods ---

// Simulating an async database call that reads files from the "blog" directory
export const getPosts = async (): Promise<BlogPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter for files in the 'blog/' directory
      const posts = Object.entries(MOCK_FILE_SYSTEM)
        .filter(([filename]) => filename.startsWith('blog/'))
        .map(([filename, fileContent], index) => {
          const { metadata, body } = parseFrontMatter(fileContent);
          // Fallbacks for missing metadata
          return {
            id: metadata.id || `generated-${index}`,
            title: metadata.title || 'Untitled Post',
            slug: metadata.slug || 'untitled',
            excerpt: metadata.excerpt || body.slice(0, 150) + '...',
            content: body,
            author: metadata.author || 'Unknown',
            publishedAt: metadata.publishedAt || new Date().toISOString(),
            tags: metadata.tags || [],
            coverImage: metadata.coverImage,
            filename: filename // Store the virtual path
          } as BlogPost;
        });
      resolve(posts);
    }, 600);
  });
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  const posts = await getPosts();
  return posts.find(p => p.id === id);
};

// Create post now supports specifying a folder
export const createPost = async (post: Omit<BlogPost, 'id' | 'publishedAt' | 'filename'>, folder: string = 'blog'): Promise<BlogPost> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.random().toString(36).substr(2, 9);
      const publishedAt = new Date().toISOString().split('T')[0];
      
      // Ensure folder starts with blog/ and remove trailing slash
      let cleanFolder = folder.replace(/\/$/, '');
      if (!cleanFolder.startsWith('blog')) {
          cleanFolder = `blog/${cleanFolder}`;
      }
      
      // Generate a virtual filename based on slug and folder
      const filename = `${cleanFolder}/${post.slug}.md`;

      const newPost: BlogPost = {
        ...post,
        id: newId,
        publishedAt,
        filename
      };

      // Create "File" content
      const fileContent = createFrontMatterString(
        {
          id: newId,
          title: newPost.title,
          slug: newPost.slug,
          author: newPost.author,
          publishedAt: newPost.publishedAt,
          tags: newPost.tags,
          coverImage: newPost.coverImage,
          excerpt: newPost.excerpt
        },
        newPost.content
      );

      // Save to virtual file system
      MOCK_FILE_SYSTEM[filename] = fileContent;
      
      resolve(newPost);
    }, 800);
  });
};

export const getAuthor = async (name: string): Promise<Author> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_AUTHORS[name] || {
        name: name,
        role: 'Guest Contributor',
        bio: `A guest writer for Zenith sharing their unique perspective on ${name === 'You' ? 'technology' : 'this topic'}.`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
      });
    }, 200);
  });
};
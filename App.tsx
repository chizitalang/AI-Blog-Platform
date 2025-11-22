import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, PenTool, Home, BookOpen, Github, Sparkles, ArrowLeft, Calendar, User, Tag, Send, Save, FileUp, Download, FolderOpen, ChevronRight } from 'lucide-react';
import { BlogPost, ViewState, Author } from './types';
import { getPosts, createPost, getPostById, getAuthor, createFrontMatterString } from './services/blogService';
import { generateBlogDraft, improveContent } from './services/geminiService';
import { Button } from './components/Button';
import { MarkdownView } from './components/MarkdownView';
import { AuthorProfile } from './components/AuthorProfile';

// --- Components (Inline for simplicity in this specific output format) ---

const Navbar = ({ 
  currentView, 
  onChangeView 
}: { 
  currentView: ViewState; 
  onChangeView: (v: ViewState) => void 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onChangeView(ViewState.HOME)}>
            <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg mr-2">
              <span className="text-white font-bold text-xl">Z</span>
            </span>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Zenith</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onChangeView(ViewState.HOME)}
              className={`text-sm font-medium transition-colors ${currentView === ViewState.HOME ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Home
            </button>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900">
              <Github className="w-5 h-5" />
            </a>
            <Button 
              variant="primary" 
              icon={<PenTool className="w-4 h-4" />}
              onClick={() => onChangeView(ViewState.EDITOR)}
            >
              Write Post
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <button 
            onClick={() => { onChangeView(ViewState.HOME); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Home
          </button>
          <button 
            onClick={() => { onChangeView(ViewState.EDITOR); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            Write Post
          </button>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Zenith Blog. Built with React & Gemini.</p>
        <p className="text-slate-400 text-xs mt-1">Designed for FastAPI Backend Integration</p>
      </div>
      <div className="flex space-x-6">
        <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">Twitter</a>
        <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">GitHub</a>
        <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">LinkedIn</a>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = ({ 
  posts, 
  onSelectPost 
}: { 
  posts: BlogPost[]; 
  onSelectPost: (id: string) => void 
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('All');

  // Extract unique folders from file paths
  const folders = React.useMemo(() => {
    const paths = new Set<string>();
    paths.add('All');
    
    posts.forEach(post => {
      if (post.filename) {
        // e.g., blog/engineering/backend/file.md -> blog/engineering/backend
        const parts = post.filename.split('/');
        // We accumulate paths: blog, blog/engineering, blog/engineering/backend
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            paths.add(currentPath);
        }
      }
    });
    
    return Array.from(paths).sort();
  }, [posts]);

  // Filter posts based on selected folder (prefix match)
  const filteredPosts = posts.filter(post => {
    if (selectedFolder === 'All') return true;
    return post.filename?.startsWith(selectedFolder);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Thoughts, Stories & Ideas.</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          A collection of articles on software development, AI, and the future of tech.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Directory Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sticky top-24">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Directories</h3>
             <ul className="space-y-1">
                {folders.map(folder => {
                   const depth = folder === 'All' ? 0 : folder.split('/').length - 1;
                   const displayName = folder === 'All' ? 'All Posts' : folder.split('/').pop();
                   
                   return (
                     <li key={folder}>
                       <button
                         onClick={() => setSelectedFolder(folder)}
                         className={`w-full text-left px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                           selectedFolder === folder 
                             ? 'bg-indigo-50 text-indigo-700' 
                             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                         }`}
                         style={{ paddingLeft: `${Math.max(0.5, depth * 1)}rem` }}
                       >
                         {folder === 'All' ? <BookOpen className="w-4 h-4 mr-2" /> : <FolderOpen className="w-4 h-4 mr-2 opacity-75" />}
                         {displayName}
                       </button>
                     </li>
                   );
                })}
             </ul>
           </div>
        </aside>

        {/* Main Content Grid */}
        <div className="flex-1">
            <div className="mb-4 flex items-center text-sm text-slate-500">
               <span className="font-semibold text-slate-900 mr-2">{filteredPosts.length}</span> 
               articles in 
               <span className="font-mono bg-slate-100 px-2 py-0.5 rounded ml-2 text-slate-700">{selectedFolder}</span>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                {filteredPosts.map((post) => (
                <article 
                    key={post.id} 
                    className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => onSelectPost(post.id)}
                >
                    {post.coverImage && (
                    <div className="h-48 w-full overflow-hidden">
                        <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {post.tags[0]}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.publishedAt}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                    </p>
                    <div className="flex items-center pt-4 border-t border-slate-100 mt-auto">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 mr-2">
                        {post.author.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-slate-500">{post.author}</span>
                            {post.filename && (
                                <div className="flex items-center text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                    <FolderOpen className="w-3 h-3 mr-1 opacity-50" />
                                    {post.filename.split('/').slice(0, -1).join('/')}
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </article>
                ))}
                {filteredPosts.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p>No posts found in this directory.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const ArticlePage = ({ post, onBack }: { post: BlogPost; onBack: () => void }) => {
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    if (post?.author) {
      getAuthor(post.author).then(setAuthor);
    }
  }, [post]);

  if (!post) return <div className="text-center py-20">Loading...</div>;

  // Generate Breadcrumbs from filename
  const breadcrumbs = post.filename ? post.filename.split('/') : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 flex items-center text-sm text-slate-500 font-mono">
         <button onClick={onBack} className="hover:text-indigo-600 transition-colors">Home</button>
         {breadcrumbs.map((crumb, idx) => (
             <React.Fragment key={idx}>
                 <ChevronRight className="w-3 h-3 mx-2" />
                 <span className={idx === breadcrumbs.length - 1 ? "text-slate-800 font-semibold" : ""}>
                     {crumb.replace('.md', '')}
                 </span>
             </React.Fragment>
         ))}
      </div>

      <article>
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center space-x-6 text-slate-500 border-b border-slate-200 pb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{post.publishedAt}</span>
            </div>
          </div>
        </header>
        
        <div className="font-serif mb-16">
           <MarkdownView content={post.content} />
        </div>

        {author && (
            <div className="border-t border-slate-200 pt-10">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">About the Author</h4>
                <AuthorProfile author={author} />
            </div>
        )}
      </article>
    </div>
  );
};

const EditorPage = ({ onCancel, onSave }: { onCancel: () => void; onSave: (post: any, folder: string) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('blog');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('zenith_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.tags) setTags(parsed.tags);
        if (parsed.folder) setFolder(parsed.folder);
      } catch (e) {
        console.error('Error parsing draft from localStorage', e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const generated = await generateBlogDraft(topic);
      setContent(generated);
      if (!title) setTitle(topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    } catch (err) {
      alert('Failed to generate content. Ensure API Key is valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    const draft = { title, content, topic, tags, folder };
    localStorage.setItem('zenith_draft', JSON.stringify(draft));
    alert('Draft saved to browser storage.');
  };

  const handlePublish = () => {
    if (!title || !content) return;
    
    // Clear draft on successful publish intent
    localStorage.removeItem('zenith_draft');

    onSave({
      title,
      content,
      excerpt: content.slice(0, 150) + '...',
      slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      author: 'You',
      tags: tags ? tags.split(',').map(t => t.trim()) : ['General'],
      coverImage: `https://picsum.photos/800/400?random=${Math.random()}`
    }, folder);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Simple Frontmatter check
      const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
      const match = text.match(frontMatterRegex);
      
      if (match) {
        const body = text.replace(frontMatterRegex, '');
        const metaBlock = match[1];
        
        // Extract basic metadata
        const titleMatch = metaBlock.match(/title:\s*(.*)/);
        const tagsMatch = metaBlock.match(/tags:\s*\[(.*)\]/);
        
        if (titleMatch) setTitle(titleMatch[1].trim());
        if (tagsMatch) setTags(tagsMatch[1]);
        setContent(body);
      } else {
        // Fallback: No frontmatter
        setContent(text);
        const titleMatch = text.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1].trim());
        } else {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExport = () => {
    if (!content) return;
    
    // Create Frontmatter + Content string
    const metadata = {
      title: title || 'Untitled',
      date: new Date().toISOString().split('T')[0],
      author: 'You',
      tags: tags ? tags.split(',').map(t => t.trim()) : ['Draft']
    };
    
    const fileContent = createFrontMatterString(metadata, content);
    
    // Generate filename consistent with "slug" logic used in backend
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || 'untitled';
    const filename = `${slug}.md`;

    const blob = new Blob([fileContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <PenTool className="w-6 h-6 mr-2 text-indigo-600" />
            New Article
          </h1>
          <p className="text-sm text-slate-500">Draft your next post with AI assistance.</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* File Operations */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".md,.markdown,.txt" 
          />
          <Button variant="ghost" onClick={handleImportClick} title="Import Markdown File">
            <FileUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={handleExport} title="Export as Markdown">
            <Download className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="outline" icon={<Save className="w-4 h-4"/>} onClick={handleSaveDraft}>Save Draft</Button>
          <Button variant="primary" icon={<Send className="w-4 h-4"/>} onClick={handlePublish}>Publish</Button>
        </div>
      </div>

      {/* AI Assistant Bar */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-indigo-900 mb-1 uppercase tracking-wide">
            <Sparkles className="w-3 h-3 inline mr-1" />
            AI Copilot
          </label>
          <div className="flex gap-2">
             <input 
              type="text" 
              placeholder="e.g., Explain Quantum Computing to a 5-year-old"
              className="flex-1 block w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Button 
              variant="secondary" 
              onClick={handleGenerate} 
              isLoading={isGenerating}
              disabled={!topic}
              className="shrink-0"
            >
              Generate Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col border-b border-slate-100 p-4 gap-4">
             <input 
              type="text" 
              placeholder="Article Title" 
              className="w-full text-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-4">
                <div className="flex-1">
                    <input 
                    type="text" 
                    placeholder="Tags (comma separated)..." 
                    className="w-full text-sm text-slate-600 placeholder-slate-400 focus:outline-none bg-slate-50 p-2 rounded"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    />
                </div>
                <div className="flex-1 flex items-center bg-slate-50 rounded px-2">
                    <span className="text-slate-400 text-sm mr-1">Path:</span>
                    <input 
                    type="text" 
                    placeholder="blog/category" 
                    className="w-full text-sm text-slate-600 placeholder-slate-400 focus:outline-none bg-transparent"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    />
                </div>
            </div>
        </div>
        
        
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'write' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('write')}
          >
            Write
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'write' ? (
            <textarea
              className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-800"
              placeholder="Start writing in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
             <div className="w-full h-full p-6 overflow-y-auto bg-white">
                <MarkdownView content={content || '*Nothing to preview yet*'} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handlePostSelect = (id: string) => {
    setActivePostId(id);
    setView(ViewState.ARTICLE);
    window.scrollTo(0, 0);
  };

  const handleSavePost = async (newPostData: any, folder: string) => {
    setIsLoading(true);
    const newPost = await createPost(newPostData, folder);
    setPosts([newPost, ...posts]);
    setView(ViewState.HOME);
    setIsLoading(false);
  };

  const activePost = activePostId ? posts.find(p => p.id === activePostId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentView={view} onChangeView={setView} />
      
      <main className="flex-1">
        {isLoading && view === ViewState.HOME ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {view === ViewState.HOME && (
              <HomePage posts={posts} onSelectPost={handlePostSelect} />
            )}
            
            {view === ViewState.ARTICLE && activePost && (
              <ArticlePage post={activePost} onBack={() => setView(ViewState.HOME)} />
            )}

            {view === ViewState.EDITOR && (
              <EditorPage onCancel={() => setView(ViewState.HOME)} onSave={handleSavePost} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
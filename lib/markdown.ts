import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

export interface BlogFrontmatter {
  title: string
  description: string
  date: string
  author?: string
  tags?: string[]
  published?: boolean
}

export interface BlogPost {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
  html: string
}

const BLOG_POSTS_DIR = path.join(process.cwd(), 'content/blog')

// Ensure directory exists
export function ensureBlogDir() {
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    fs.mkdirSync(BLOG_POSTS_DIR, { recursive: true })
  }
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  ensureBlogDir()

  const files = fs.readdirSync(BLOG_POSTS_DIR).filter((file) => file.endsWith('.md'))

  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '')
      return getBlogPost(slug)
    })
  )

  // Sort by date descending
  return posts.filter((post) => post.frontmatter.published !== false).sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  })
}

// Get a single blog post
export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = path.join(BLOG_POSTS_DIR, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Blog post not found: ${slug}`)
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  // Process markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content)

  const html = processedContent.toString()

  return {
    slug,
    frontmatter: data as BlogFrontmatter,
    content,
    html,
  }
}

// Get blog post by slug for static generation
export function getBlogPostSlugs(): string[] {
  ensureBlogDir()
  const files = fs.readdirSync(BLOG_POSTS_DIR).filter((file) => file.endsWith('.md'))
  return files.map((file) => file.replace(/\.md$/, ''))
}

// Convert raw markdown string to HTML
export async function renderMarkdownToHtml(markdownContent: string): Promise<string> {
  if (!markdownContent) return ''
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(markdownContent)
  return processed.toString()
}

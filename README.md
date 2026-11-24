<div align="center">

<img src="public/deckgen.png" alt="DeckGen Logo" width="120" height="120" />

# 🎨 DeckGen

### Transform Your Ideas Into Stunning Presentations

<p align="center">
  <strong>Stop staring at blank slides. Start with DeckGen.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack-Latest-FF4154?style=for-the-badge&logo=react-router&logoColor=white" alt="TanStack" />
  <img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Made%20with-❤️-red.svg?style=for-the-badge" alt="Made with Love" />
</p>

---

</div>

## 🌟 What is DeckGen?

**DeckGen** is an AI-powered presentation generator that transforms your raw ideas into polished, professional slide decks. Just describe what you want to say, and our AI handles the structure, design, and visuals—no design skills needed!

### ✨ Why DeckGen?

- 🚀 **Lightning Fast** - Go from idea to complete deck in minutes
- 🎨 **Beautiful by Default** - Professional designs with 3D effects and depth
- 🤖 **AI-Powered** - Uses OpenRouter (free tier) for intelligent content generation
- 🖼️ **Smart Visuals** - Automatic image generation from Unsplash
- 📊 **Fully Customizable** - Tweak styles, tones, and layouts to match your brand
- 💾 **Export Ready** - Download as PowerPoint (.pptx) format
- 🎯 **Zero Learning Curve** - If you can write an email, you can use DeckGen

---

## 🎯 Features

### 🎨 AI-Powered Generation
- **Smart Content Creation** - Uses OpenRouter's free Llama 3.3 70B model
- **Intelligent Structuring** - Automatically organizes your ideas into logical slides
- **Context-Aware** - Understands your topic and creates relevant content

### 🖼️ Visual Excellence
- **Automatic Images** - High-quality photos from Unsplash Source API
- **3D Effects** - Modern depth, shadows, and perspective transforms
- **Glass Morphism** - Sleek, frosted glass UI components
- **Responsive Design** - Perfect on desktop, tablet, and mobile

### 📋 Presentation Management
- **Smart Sections** - Organize by Today, Yesterday, Last 7 days, Last 30 days, Older
- **Search & Filter** - Quickly find presentations with full-text search
- **Sort Options** - By date or alphabetically
- **Grid & List Views** - Choose your preferred layout
- **Quick Actions** - Duplicate, share, export, or delete with one click

### 🎭 Customization Options
- **4 Visual Styles** - Minimal, Professional, Creative, Bold
- **4 Tone Options** - Formal, Casual, Informative, Persuasive
- **3 Layout Types** - Bullet Points, Visual, Balanced
- **3-20 Slides** - Choose exactly how many slides you need
- **6 Templates** - Quick-start with pre-built content

### 🔧 Advanced Features
- **Presentation Duplication** - Clone entire presentations with all slides
- **Native Sharing** - Share via Web Share API or copy link
- **Slide Preview** - See thumbnails of all your slides
- **Fullscreen Mode** - Distraction-free editing
- **Speaker Notes** - AI-generated notes for each slide
- **Export to PowerPoint** - Fully editable .pptx files

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (or use [Neon.tech](https://neon.tech) free tier)
- **OpenRouter API key** (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deckgen.git
cd deckgen

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database (use Neon.tech for free PostgreSQL)
DATABASE_URL="your_postgresql_connection_string"

# Authentication
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3000

# OAuth (Optional - for GitHub/Google login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Background Jobs
INNGEST_DEV=1

# AI Text Generation (Required)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Image Generation (Optional)
IMAGE_SOURCE=unsplash
```

### Getting API Keys

#### 1. OpenRouter API Key (Required - Free)

OpenRouter provides access to multiple AI models with a generous free tier:

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy and add to `.env` as `OPENROUTER_API_KEY`

**Free Model**: We use `meta-llama/llama-3.3-70b-instruct:free` by default.

#### 2. Database Setup (Free)

For a free PostgreSQL database:

1. Visit [Neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add to `.env` as `DATABASE_URL`

### Database Migration

```bash
# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Running the Application

You'll need **two terminals**:

**Terminal 1 - Web Server:**
```bash
npm run dev
```

**Terminal 2 - Background Jobs (Inngest):**
```bash
npx inngest-cli@latest dev
```

The app will be available at **http://localhost:3000**

---

## 🏗️ Project Structure

```
deckgen/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
│
├── public/
│   ├── deckgen.png           # App logo
│   └── favicon.ico           # Favicon
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   └── Navbar.tsx       # Main navigation
│   │
│   ├── features/            # Feature-based modules
│   │   └── presentation/    # Presentation feature
│   │       ├── actions/     # Server functions
│   │       ├── components/  # Feature components
│   │       ├── hooks/       # React hooks
│   │       ├── lib/         # Utilities
│   │       └── types/       # TypeScript types
│   │
│   ├── integrations/        # Third-party integrations
│   │   ├── inngest/         # Background jobs
│   │   └── better-auth/     # Authentication
│   │
│   ├── routes/              # TanStack Router routes
│   │   ├── index.tsx        # Home page
│   │   ├── about.tsx        # About page
│   │   ├── contact.tsx      # Contact page
│   │   └── presentations/   # Presentation routes
│   │
│   ├── styles/              # Global styles
│   │   ├── styles.css       # Main stylesheet
│   │   └── 3d-effects.css   # 3D effect utilities
│   │
│   └── lib/                 # Shared utilities
│       ├── auth.ts          # Auth configuration
│       └── utils.ts         # Helper functions
│
├── .env                     # Environment variables
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts          # Vite configuration
```

---

## 💻 Tech Stack

### Frontend
- **[React 19.2](https://react.dev/)** - UI library
- **[TypeScript 6.0](https://www.typescriptlang.org/)** - Type safety
- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[Tailwind CSS 4.1](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful components

### Backend
- **[Prisma 7.10](https://www.prisma.io/)** - Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Better Auth](https://www.better-auth.com/)** - Authentication
- **[Inngest](https://www.inngest.com/)** - Background job processing

### AI & APIs
- **[OpenRouter](https://openrouter.ai/)** - AI text generation (free tier)
- **[Unsplash Source](https://source.unsplash.com/)** - Stock photos (free)
- **[pptxgenjs](https://gitbrent.github.io/PptxGenJS/)** - PowerPoint generation

### Development Tools
- **[Vite 8.0](https://vitejs.dev/)** - Build tool
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vitest](https://vitest.dev/)** - Unit testing

---

## 🎮 Usage

### Creating Your First Presentation

1. **Describe Your Topic**
   ```
   Example: "I want to pitch our new mobile app to investors. 
   It's a fitness tracker that uses AI to create personalized 
   workout plans..."
   ```

2. **Choose Your Settings**
   - Number of slides: 3-20
   - Style: Minimal, Professional, Creative, or Bold
   - Tone: Formal, Casual, Informative, or Persuasive
   - Layout: Bullet Points, Visual, or Balanced

3. **Generate**
   - Click "Generate PPT"
   - AI creates your presentation in ~30 seconds
   - Background job processes slides with images

4. **Edit & Export**
   - Preview slides in fullscreen
   - Make adjustments to settings
   - Export to PowerPoint format

### Using Templates

1. Scroll to the templates section
2. Click any template card
3. Content auto-fills into the form
4. Customize and generate

### Managing Presentations

- **Search**: Type in the search bar to filter
- **Sort**: Choose recent, oldest, or alphabetical
- **View**: Toggle between grid and list layouts
- **Actions**: Hover over cards for quick actions
  - Open presentation
  - Duplicate
  - Share
  - Delete

---

## 🛠️ Development

### Running Tests

```bash
npm run test
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format with Prettier
npm run format

# Check formatting
npm run check
```

### Building for Production

```bash
npm run build
```

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## 🐛 Troubleshooting

### "fetch failed" Error

**Cause**: Missing OpenRouter API key or Inngest not running

**Solution**:
1. Check `.env` has `OPENROUTER_API_KEY`
2. Verify Inngest dev server is running: `npx inngest-cli@latest dev`
3. Check database connection with `npx prisma studio`

### Presentation Stays in "GENERATING"

**Cause**: Background job error

**Solution**:
1. Check Inngest terminal for error messages
2. Verify OpenRouter API key is valid
3. Restart Inngest: `npx inngest-cli@latest dev`

### Images Not Loading

**Cause**: Network issue with Unsplash

**Solution**:
- Images are fetched from Unsplash on-demand
- Check browser console for errors
- Verify internet connection

### Database Connection Issues

**Cause**: Invalid `DATABASE_URL`

**Solution**:
1. Verify PostgreSQL is running
2. Check connection string format
3. Test with `npx prisma studio`

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### Reporting Bugs

1. Check if the issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Feature Requests

1. Open an issue describing:
   - The feature
   - Why it's useful
   - Proposed implementation (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation
- Test your changes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) - Amazing React ecosystem
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [OpenRouter](https://openrouter.ai/) - Free AI API access
- [Unsplash](https://unsplash.com/) - Stunning free images
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Inngest](https://www.inngest.com/) - Background job processing

---

## 📞 Support

- 📧 Email: manishmotirale@proton.me
- 🐛 Issues: [GitHub Issues](https://github.com/manishmotirale/deckgen/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/manishmotirale/deckgen/discussions)

---

## 🗺️ Roadmap

- [ ] PDF Export
- [ ] Slide reordering (drag & drop)
- [ ] Real-time collaboration
- [ ] Custom themes
- [ ] Slide animations
- [ ] Video backgrounds
- [ ] Chart & diagram tools
- [ ] Version history
- [ ] Mobile app
- [ ] API for developers

---

<div align="center">

**Made with ❤️ by the DeckGen Team**

⭐ Star us on GitHub — it helps!

[Website](https://deckgen.app) • [Twitter](https://twitter.com/deckgen) • [Discord](https://discord.gg/deckgen)

</div>

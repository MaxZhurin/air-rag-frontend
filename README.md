# RAG-AI-Chat Frontend

Modern AI chat interface built with Nuxt 4, Nuxt UI, and Tailwind CSS with document search capabilities.

## Features

- 🎨 Beautiful UI with Nuxt UI components
- 🌓 Dark/Light mode support
- 💬 Real-time AI chat interface
- 📄 Document management dashboard
- 🔐 Google OAuth authentication
- 📱 Responsive design
- ⚡ Fast and optimized with Nuxt 4

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Backend server running

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start the development server:
```bash
pnpm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
├── pages/                  # Nuxt pages (routes)
│   ├── index.vue          # Login page
│   ├── chat.vue           # Main chat interface
│   └── auth/
│       └── callback.vue   # OAuth callback
├── components/            # Vue components
│   ├── ChatInterface.vue  # Chat UI with sidebar
│   └── DocumentsDashboard.vue
├── composables/           # Vue composables
│   ├── useApi.ts         # API client
│   ├── useChat.ts        # Chat operations
│   └── useDocuments.ts   # Document operations
├── stores/                # Pinia stores
│   ├── auth.ts           # Authentication state
│   ├── chat.ts           # Chat state
│   └── documents.ts      # Documents state
├── middleware/            # Nuxt middleware
│   └── auth.ts           # Auth guard
├── app/
│   └── app.vue           # Root component
└── nuxt.config.ts        # Nuxt configuration
```

## Pages

### Landing / Login (`/`)
- Google OAuth login button
- Welcome screen

### Chat Interface (`/chat`)
Protected route with two tabs:

**Chat Tab:**
- Left sidebar with chat list
- "New Chat" button
- Chat selection
- Center area with messages
- Message input with send button
- Right sidebar for document preview (when clicked)

**Documents Tab:**
- Upload documents button
- Document grid with:
  - File name and type
  - Status badge (uploading/processing/ready/error)
  - Size and upload date
  - Actions menu (reprocess, delete)
- Empty state when no documents

### OAuth Callback (`/auth/callback`)
- Handles Google OAuth redirect
- Saves token and user data
- Redirects to chat

## Features in Detail

### Authentication
- Google OAuth 2.0 integration
- JWT token storage in localStorage
- Automatic token refresh
- Protected routes with middleware

### Chat
- Create multiple chat sessions
- Send messages to AI
- View AI responses with document references
- Click document references to preview
- Auto-scroll to latest messages
- Chat history persisted
- Delete chats

### Documents
- Upload PDF, DOCX, TXT files
- Real-time processing status
- Document search integration with chat
- Delete and reprocess documents
- File size and type validation

### UI/UX
- Modern, clean interface
- Smooth animations
- Loading states
- Toast notifications
- Dark mode support
- Responsive design

## Building for Production

```bash
pnpm run build
pnpm run preview
```

## Deployment on Railway

This project includes a Dockerfile optimized for deployment on [Railway](https://railway.com/).

### Prerequisites

1. A Railway account
2. GitHub repository with your code

### Deployment Steps

1. **Connect your repository to Railway:**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure environment variables:**
   In Railway project settings, add the following environment variables:
   ```
   NUXT_PUBLIC_API_BASE=https://your-backend-url.com/api
   NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Deploy:**
   - Railway will automatically detect the `Dockerfile` and start building
   - The build process will:
     - Install dependencies using pnpm
     - Build the Nuxt application
     - Create a production-ready Docker image

4. **Custom Domain (Optional):**
   - In Railway project settings, go to "Settings" → "Domains"
   - Add your custom domain
   - Railway will automatically configure SSL

### Dockerfile Features

- **Multi-stage build** for optimized image size
- **Security**: Runs as non-root user
- **Health checks** for Railway monitoring
- **Automatic PORT handling** (Railway sets PORT automatically)
- **Production optimizations** with minimal dependencies

### Notes

- Railway automatically sets the `PORT` environment variable
- The application listens on `0.0.0.0` to accept external connections
- Health checks are configured to monitor application status
- Build time is optimized with layer caching

## Configuration

### Nuxt Config (`nuxt.config.ts`)
- Modules: Nuxt UI, Pinia, Tailwind CSS, Color Mode
- SSR disabled for client-side rendering
- Runtime config for API base URL

### Environment Variables
- `NUXT_PUBLIC_API_BASE` - Backend API URL
- `NUXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID

## Styling

The app uses:
- **Nuxt UI** - Pre-built Vue components
- **Tailwind CSS** - Utility-first CSS
- **Color Mode** - Dark/light theme switching

## State Management

Using Pinia stores:
- `authStore` - User authentication and profile
- `chatStore` - Chat sessions and messages
- `documentsStore` - Document list and upload state

## API Integration

All API calls go through `useApi()` composable which:
- Adds JWT token to requests
- Handles 401 errors (auto-logout)
- Base URL from config

## Development Tips

1. Make sure backend is running first
2. Check console for API errors
3. Use Vue DevTools for debugging
4. Check Network tab for API calls

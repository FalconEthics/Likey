# Likey - Social Media Platform

A modern Instagram-like social media platform built with SvelteKit, Supabase, and DaisyUI.

## 🚀 Features

### Core Features (MVP)
- **User Authentication** - Sign up/login with email & password using Supabase Auth
- **Profile Management** - Customizable profiles with usernames, display names, bios, and profile pictures
- **Photo Sharing** - Upload and share multiple photos per post with automatic compression
- **Feed System** - Home feed with infinite scroll showing posts from followed users
- **Social Interactions** - Like and comment on posts
- **Following System** - Follow/unfollow users with real-time follower counts
- **Real-time Notifications** - Instant notifications for likes, comments, and new followers

### Extended Features
- **Direct Messaging** - Real-time 1:1 chat with message history
- **Trending Posts** - Algorithm-based trending content with time decay
- **Explore Page** - Discover trending posts, popular users, and latest content
- **User Recommendations** - Mutual follower-based user suggestions
- **Profile Search** - Find users by username or display name with real-time results
- **Virtualized Feed** - High-performance scrolling for thousands of posts
- **Icon System** - Lucide Svelte icons throughout the interface
- **Responsive Design** - Works perfectly on desktop and mobile
- **Dark/Light Mode** - Theme switching with persistence
- **Image Optimization** - Automatic image compression before upload
- **Real-time Updates** - Live updates using Supabase Realtime
- **PWA Support** - Installable as a mobile app

## 🛠 Tech Stack

- **Runtime**: Bun
- **Frontend**: SvelteKit 5+ with modern syntax
- **Styling**: Tailwind CSS + DaisyUI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Icons**: Lucide Svelte for consistent SVG icons
- **Virtualization**: @tanstack/svelte-virtual for performance
- **Animation**: Motion for smooth transitions
- **Utilities**: Lodash for utility functions

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git
- Supabase CLI (for database setup)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd likey
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

#### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
# or
bun install -g supabase
```

2. Set up the database schema:
```bash
# Link to your Supabase project (replace YOUR_PROJECT_REF with your project ID)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the complete database schema
supabase db push
```

That's it! This will create all tables, RLS policies, functions, triggers, and storage buckets automatically.

#### Option 2: Manual Setup

If you prefer manual setup:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor  
3. Copy and paste the contents of `supabase/migrations/20250820190123_remote_schema.sql`
4. Run the SQL commands to create all tables, functions, triggers, and policies

### 5. Verify Setup

1. Check that the `images` storage bucket was created automatically
2. Verify all tables are present in your Database dashboard
3. Test that you can sign up and create a profile

### 6. Start Development Server

```bash
bun run dev
# or
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── Navigation.svelte
│   │   ├── Post.svelte
│   │   ├── Feed.svelte          # Standard feed component
│   │   ├── VirtualizedFeed.svelte # High-performance virtualized feed
│   │   ├── FeedComparison.svelte  # A/B testing component
│   │   ├── UserCard.svelte
│   │   ├── LoginModal.svelte
│   │   ├── SignupModal.svelte
│   │   └── CreatePostModal.svelte
│   ├── auth.js             # Authentication logic
│   ├── supabase.js         # Supabase client configuration
│   ├── stores.js           # Svelte stores for state management
│   ├── utils.js            # Utility functions
│   ├── notifications.js    # Real-time notifications
│   ├── messages.js         # Direct messaging API
│   └── search.js           # Search and trending functionality
├── routes/                 # SvelteKit routes
│   ├── +layout.svelte      # Main layout
│   ├── +page.svelte        # Home page (uses VirtualizedFeed)
│   ├── profile/[username]/ # User profiles
│   ├── settings/           # User settings
│   ├── notifications/      # Notifications page
│   ├── messages/           # Direct messaging interface
│   │   ├── +page.svelte         # Messages list
│   │   └── [conversationId]/    # Individual chat
│   └── explore/            # Explore page with trending content
└── app.css                 # Global styles
```

## 🎨 Customization

### Themes

The app uses DaisyUI themes. You can customize themes in `tailwind.config.js`:

```js
daisyui: {
  themes: ['light', 'dark', 'cupcake', 'cyberpunk'], // Add your themes
}
```

### Styling

- Global styles in `src/app.css`
- Component-specific styles using Tailwind classes
- DaisyUI components for consistent UI elements

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app uses the Vercel adapter by default. For other platforms:

1. Install the appropriate SvelteKit adapter
2. Update `svelte.config.js`
3. Follow platform-specific deployment instructions

## 📱 PWA Features

The app is ready for PWA implementation:

- Add `app.webmanifest` for app metadata
- Implement service worker for offline functionality
- Add installation prompts

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Input validation and sanitization
- Secure file uploads with type checking
- Rate limiting ready for implementation
- CSRF protection through Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Troubleshooting

### Common Issues

1. **Supabase CLI setup issues**: 
   - Make sure you're logged in: `supabase login`
   - Verify project link: `supabase projects list`
   - Check you have the correct project reference ID

2. **Database migration fails**: 
   - Ensure your Supabase project is empty before running `supabase db push`
   - Check your internet connection
   - Verify project permissions in Supabase dashboard

3. **Supabase connection issues**: Verify your environment variables in `.env.local`

4. **Image upload fails**: Check storage policies and bucket configuration

5. **Real-time not working**: The migrations include all necessary RLS policies for real-time

6. **Build errors**: Make sure all dependencies are installed with `bun install`

### Getting Help

- Check the browser console for errors
- Verify Supabase logs in the dashboard
- Ensure all database tables are created correctly

## 🎯 Next Steps

- [ ] Add story features
- [ ] Create admin dashboard
- [ ] Add content moderation
- [ ] Implement analytics
- [ ] Add push notifications
- [ ] Group messaging
- [ ] Video/voice calls
- [ ] Advanced search filters

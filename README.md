<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/soumikdas/Likey">
    <img src="src/lib/assets/Likey.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Likey - Social Media Platform</h3>

  <p align="center">
    A modern, production-ready Instagram-like social media platform built with SvelteKit 5, Supabase, and modern web technologies.
  <p align="center">
    <a href="https://likey-social.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/soumikdas/Likey/issues">Report Bug</a>
    ·
    <a href="https://github.com/soumikdas/Likey/issues">Request Feature</a>
  </p>
</div>

## <a href="https://likey-social.vercel.app/">🚀 Live Demo</a>

<!-- ABOUT THE PROJECT -->

## About The Project

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#security-features">Security Features</a></li>
    <li><a href="#performance">Performance</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- Add screenshot here when available -->
<!-- <img src="src/assets/screenshot.png"> -->

Likey is a production-ready, modern social media platform that recreates the Instagram experience with cutting-edge web technologies. Built with SvelteKit 5's latest features, real-time capabilities through Supabase, and optimized for performance and user experience.

### 🎯 Key Features

#### Core Social Features

- **📱 User Authentication**: Secure email/password authentication with Supabase Auth
- **👤 Profile Management**: Customizable profiles with usernames, display names, bios, and profile pictures
- **📸 Photo Sharing**: Upload and share multiple photos per post with automatic compression
- **🏠 Feed System**: Infinite scroll home feed with posts from followed users
- **❤️ Social Interactions**: Like and comment on posts with real-time updates
- **👥 Following System**: Follow/unfollow users with live follower counts
- **🔔 Real-time Notifications**: Instant notifications for likes, comments, and new followers

#### Advanced Features

- **💬 Direct Messaging**: Real-time 1:1 chat with message history and context menus
- **📈 Trending Algorithm**: Score-based trending posts with time decay
- **🔍 Explore Page**: Discover trending posts, popular users, and latest content
- **🎯 User Recommendations**: Intelligent user suggestions based on mutual connections
- **⚡ Search System**: Real-time user search with debounced queries
- **🎨 Modern UI/UX**: Glassmorphism design with smooth animations and transitions
- **🌙 Theme Support**: Light/dark mode with system preference detection
- **📱 Responsive Design**: Mobile-first design with desktop enhancements
- **🔄 Real-time Updates**: Live updates using Supabase Realtime subscriptions

### Built With

- ![SvelteKit][SvelteKit.com] - SvelteKit 5 with modern runes syntax and server-side rendering
- ![TypeScript][TypeScript.com] - JSDoc type annotations for type safety without TypeScript overhead
- ![Supabase][Supabase.com] - PostgreSQL database with real-time subscriptions, auth, and storage
- ![Tailwind][Tailwind.com] - Tailwind CSS v4 with DaisyUI component system
- ![Bun][Bun.com] - Ultra-fast JavaScript runtime and package manager
- ![Lucide][Lucide.com] - Beautiful, customizable SVG icons
- ![Vite][Vite.com] - Lightning-fast build tool with hot module replacement
- ![Vercel][Vercel.com] - Seamless deployment and hosting platform

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- INSTALLATION -->

## Installation

Get a local copy up and running with these simple steps.

### Prerequisites

- **Bun** (recommended) or Node.js 18+

  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```

  or

  ```sh
  npm install -g npm@latest
  ```

- **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

### Installation Steps

1. **Clone the repository**

   ```sh
   git clone https://github.com/soumikdas/Likey.git
   ```

2. **Navigate to project directory**

   ```sh
   cd Likey
   ```

3. **Install dependencies**

   ```sh
   bun install
   # or
   npm install
   ```

4. **Set up environment variables**

   ```sh
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:

   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up database schema**

   **Option A: Using Supabase CLI (Recommended)**

   ```sh
   # Install Supabase CLI
   bun install -g supabase

   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Deploy schema
   supabase db push
   ```

   **Option B: Manual Setup**
   - Copy contents of `database-setup.sql`
   - Run in Supabase SQL Editor

6. **Start development server**

   ```sh
   bun run dev
   # or
   npm run dev
   ```

7. **Open your browser** and navigate to `http://localhost:5173`

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## Usage

### 🚀 Getting Started

1. **Create Account**: Sign up with email and password
2. **Set Up Profile**: Add display name, username, bio, and profile picture
3. **Explore Content**: Browse trending posts and discover new users
4. **Start Posting**: Share photos with captions and engage with the community
5. **Build Network**: Follow interesting users and get recommendations

### 📱 Core Workflows

**Content Creation**:

- Upload multiple images per post with automatic compression
- Add captions and share with your followers
- Real-time post visibility in followers' feeds

**Social Interaction**:

- Like and comment on posts with instant updates
- Follow/unfollow users with live count updates
- Receive real-time notifications for all interactions

**Discovery**:

- Explore trending posts based on engagement algorithms
- Find new users through intelligent recommendations
- Search users by username or display name

**Messaging**:

- Send direct messages with real-time delivery
- Edit messages within 5 minutes of sending
- Forward messages to other conversations
- Context menu for message actions

**Profile Management**:

- Customize profile with bio, profile picture, and theme preferences
- View followers, following, and post statistics
- Manage account settings and privacy

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🏗️ Architecture

### Tech Stack Details

- **Frontend**: SvelteKit 5 with modern runes syntax (`$state`, `$derived`, `$effect`)
- **Backend**: Supabase PostgreSQL with Row Level Security (RLS)
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for image hosting
- **Styling**: Tailwind CSS v4 with DaisyUI components
- **Icons**: Lucide Svelte for consistent SVG icons
- **Build**: Vite with SWC compiler for optimal performance
- **Runtime**: Bun for development and package management
- **Deployment**: Vercel with automatic deployments

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── Navigation.svelte     # Top navigation with auth state
│   │   ├── BottomNavigation.svelte # Mobile navigation
│   │   ├── Post.svelte           # Post component with interactions
│   │   ├── Feed.svelte           # Infinite scroll feed
│   │   ├── UserCard.svelte       # User profile cards
│   │   └── Modals/               # Authentication and post modals
│   ├── auth.js             # Authentication logic
│   ├── supabase.js         # Supabase client and utilities
│   ├── stores.js           # Centralized state management
│   ├── notifications.js    # Real-time notification system
│   ├── messages.js         # Direct messaging API
│   ├── search.js           # Search and trending algorithms
│   └── utils.js            # Utility functions
├── routes/                 # SvelteKit file-based routing
│   ├── +layout.svelte           # Main app layout
│   ├── +page.svelte             # Home feed
│   ├── profile/[username]/      # Dynamic user profiles
│   ├── post/[id]/               # Individual post pages
│   ├── messages/                # Messaging interface
│   ├── notifications/           # Notifications page
│   ├── explore/                 # Discovery and trending
│   └── settings/                # User settings
└── app.css                 # Global styles with Tailwind
```

### Database Schema

**Core Tables**:

- `profiles` - User profile information
- `posts` - User posts with metadata
- `post_images` - Multiple images per post
- `likes` - Post likes with user tracking
- `comments` - Post comments with threading support
- `follows` - User follow relationships
- `notifications` - Real-time notification system
- `conversations` - Direct message conversations
- `messages` - Individual chat messages

**Advanced Features**:

- `trending_posts` - Algorithmic trending calculation
- `user_recommendations` - Intelligent user suggestions
- Row Level Security (RLS) on all tables
- Real-time subscriptions for live updates
- Automated triggers for notification generation

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🔒 Security Features

### Authentication & Authorization

- **Supabase Auth**: Industry-standard authentication with JWT tokens
- **Row Level Security**: Database-level access control for all tables
- **Profile Protection**: Users can only modify their own data
- **Secure Sessions**: Automatic session management with refresh tokens

### Data Security

- **Input Validation**: Comprehensive validation on all user inputs
- **Image Security**: File type validation and automatic compression
- **SQL Injection Protection**: Parameterized queries through Supabase
- **CSRF Protection**: Built-in protection through Supabase client

### Privacy Features

- **Conversation Privacy**: Only participants can access message threads
- **Profile Visibility**: Configurable privacy settings
- **Secure File Upload**: Validated image uploads with size limits
- **Real-time Security**: RLS policies applied to real-time subscriptions

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## ⚡ Performance

### Optimization Features

- **Infinite Scroll**: Efficient pagination for large datasets
- **Image Compression**: Automatic client-side image optimization
- **Real-time Efficiency**: Selective subscriptions for relevant data only
- **Responsive Images**: Multiple resolutions for different screen sizes
- **Code Splitting**: Route-based code splitting with SvelteKit

### Modern Web Standards

- **SvelteKit 5**: Latest framework features with optimal bundle sizes
- **Vite Build**: Lightning-fast development and production builds
- **Modern CSS**: Tailwind CSS v4 with advanced features
- **Progressive Enhancement**: Works without JavaScript for core features

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel dashboard

2. **Environment Variables**

   ```
   PUBLIC_SUPABASE_URL=your_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Deploy**
   - Automatic deployments on every push to main
   - Preview deployments for pull requests

### Manual Deployment

1. **Build the project**

   ```sh
   bun run build
   ```

2. **Preview locally**

   ```sh
   bun run preview
   ```

3. **Deploy to your platform** using the generated build artifacts

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🌟 Key Innovations

- **Modern Svelte 5**: Utilizes latest Svelte features including runes and modern syntax
- **Real-time Everything**: Live updates for posts, messages, notifications, and user interactions
- **Intelligent Algorithms**: Score-based trending and recommendation systems
- **Mobile-First Design**: Optimized for mobile with progressive desktop enhancement
- **Type Safety**: Comprehensive JSDoc annotations without TypeScript overhead
- **Performance Optimized**: Infinite scroll, image compression, and efficient real-time subscriptions
- **Production Ready**: Complete with security, error handling, and deployment configuration

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- CONTRIBUTING -->

## Contributing

Contributions make the open source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Development Setup

1. Fork the Project
2. Create your Feature Branch
   ```sh
   git checkout -b feature/AmazingFeature
   ```
3. Install dependencies
   ```sh
   bun install
   ```
4. Set up your local environment following the installation guide
5. Make your changes and test thoroughly
6. Commit your Changes
   ```sh
   git commit -m 'Add some AmazingFeature'
   ```
7. Push to the Branch
   ```sh
   git push origin feature/AmazingFeature
   ```
8. Open a Pull Request

### Development Guidelines

- Follow Svelte 5 modern syntax (use `$state`, `$derived`, `$effect`)
- Use JSDoc for type annotations
- Test your changes across different screen sizes
- Ensure real-time features work correctly
- Follow the existing code style and component patterns

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- CONTACT -->

## Contact

<ul>
<li><a href="https://www.linkedin.com/in/soumik-das-profile/"> LinkedIn Profile</a></li>
<li><a href="https://mrsoumikdas.com/"> Portfolio Site</a></li>
<li><a href="https://www.instagram.com/account.soumik.das/"> Instagram Handle</a></li>
</ul>

Project Link: [https://github.com/soumikdas/Likey](https://github.com/soumikdas/Likey)

~ Check out my other projects: [https://github.com/FalconEthics](https://github.com/FalconEthics)

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

This project showcases modern full-stack development with cutting-edge technologies. It demonstrates expertise in:

- **Modern Frontend Development**: SvelteKit 5, Tailwind CSS, and responsive design
- **Real-time Applications**: Supabase Realtime for live user interactions
- **Database Design**: PostgreSQL with Row Level Security and complex relationships
- **Performance Optimization**: Infinite scroll, image compression, and efficient data loading
- **User Experience**: Mobile-first design with progressive enhancement
- **Production Deployment**: Vercel integration with CI/CD workflows

Perfect for learning modern web development patterns and building production-ready social applications.

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- MARKDOWN LINKS & IMAGES -->

[contributors-shield]: https://img.shields.io/github/contributors/soumikdas/Likey.svg?style=for-the-badge
[contributors-url]: https://github.com/soumikdas/Likey/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/soumikdas/Likey.svg?style=for-the-badge
[forks-url]: https://github.com/soumikdas/Likey/network/members
[stars-shield]: https://img.shields.io/github/stars/soumikdas/Likey.svg?style=for-the-badge
[stars-url]: https://github.com/soumikdas/Likey/stargazers
[issues-shield]: https://img.shields.io/github/issues/soumikdas/Likey.svg?style=for-the-badge
[issues-url]: https://github.com/soumikdas/Likey/issues
[license-shield]: https://img.shields.io/github/license/soumikdas/Likey.svg?style=for-the-badge
[license-url]: https://github.com/soumikdas/Likey/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/soumik-das-profile/
[SvelteKit.com]: https://img.shields.io/badge/SvelteKit_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white
[TypeScript.com]: https://img.shields.io/badge/JSDoc-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[Supabase.com]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Tailwind.com]: https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Bun.com]: https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white
[Lucide.com]: https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white
[Vite.com]: https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white
[Vercel.com]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white

# Venn Sky

A Next.js application that visualizes the overlap of followers or following between Blue Sky users.

## Features

- 🔍 Compare followers or following lists between 2 or more Blue Sky users
- 📊 View overlapping users that appear in all lists
- 🎯 See unique users for each account
- 🎨 Clean, modern UI with dark mode support
- 🚀 Built with Next.js 16, React 19, TypeScript, and Tailwind CSS
- 🌐 Uses the official AT Protocol API (@atproto/api)

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Choose whether to compare **Followers** or **Following** lists
2. Enter 2 or more Blue Sky handles (without the @ symbol)
   - Example: `user.bsky.social`
3. Click "Analyze Overlap" to see the results
4. View:
   - **Overlapping Users**: People who appear in all lists
   - **Unique Users**: People who only appear in one user's list

## How It Works

The app uses the AT Protocol API to:
1. Fetch the complete followers or following list for each user (with pagination)
2. Calculate the intersection of all lists to find overlapping users
3. Identify users unique to each account
4. Display results with user avatars, display names, and handles

## API Rate Limits

The Blue Sky public API has rate limits. For users with large follower/following counts, the analysis may take some time as the app fetches all pages of results.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Static Export
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **API Client**: @atproto/api (Blue Sky/AT Protocol)
- **Deployment**: GitHub Pages / Static Hosting

## Development

### Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory that can be deployed to any static hosting service.

### Local Testing

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

## Deployment

### GitHub Pages (Automated)

This repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

**Setup Steps:**

1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source
3. Push to the `main` branch to trigger deployment
4. Your app will be available at `https://<username>.github.io/<repository-name>/`

### Manual Static Deployment

You can deploy the static build to any hosting service:

1. Build the app: `npm run build`
2. Deploy the contents of the `out/` directory to:
   - GitHub Pages
   - Netlify
   - Vercel
   - Cloudflare Pages
   - Any static file hosting service

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Uses the [AT Protocol](https://atproto.com/) and [Blue Sky API](https://docs.bsky.app/)
- Inspired by Venn diagram visualizations

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

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **API Client**: @atproto/api (Blue Sky/AT Protocol)
- **Deployment**: Vercel-ready

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## API Rate Limits

The Blue Sky public API has rate limits. For users with large follower/following counts, the analysis may take some time as the app fetches all pages of results.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Uses the [AT Protocol](https://atproto.com/) and [Blue Sky API](https://docs.bsky.app/)
- Inspired by Venn diagram visualizations

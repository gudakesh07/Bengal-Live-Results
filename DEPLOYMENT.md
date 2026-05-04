# Deployment Instructions for Vercel

This project is configured for deployment on Vercel. Follow these steps:

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with the repository

## Steps to Deploy

1. **Connect Repository to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect the project settings

2. **Set Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add the required variables:
     - `GEMINI_API_KEY`: Your Gemini API key

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your project

## Project Structure for Vercel

```
├── api/                          # Serverless Functions
│   └── results.ts               # Election data API endpoint
├── src/                         # Frontend React app
│   ├── App.tsx
│   ├── main.tsx
│   ├── data.ts
│   ├── images.ts
│   ├── types.ts
│   ├── assets/
│   │   └── images/
│   └── data/
│       └── election-results.json
├── vercel.json                  # Vercel configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Local Development

```bash
# Install dependencies
npm install

# Start development server with API
# The frontend runs on http://localhost:5173
# The API endpoint is at /api/results
npm run dev
```

## How It Works

1. **Frontend**: Built with Vite + React
   - Located in `src/` folder
   - Built to `dist/` folder during build
   - Static files served by Vercel

2. **API**: Serverless Functions
   - Located in `api/` folder
   - `/api/results` fetches live election data from ECI
   - Automatically deployed as serverless functions

3. **Data Flow**:
   - Frontend calls `/api/results` endpoint
   - API fetches data from ECI or local JSON
   - Results are displayed in the UI

## Troubleshooting

- **Build fails**: Check that all dependencies are installed
- **API errors**: Verify GEMINI_API_KEY is set in environment variables
- **Images not loading**: Ensure image files are in `src/assets/images/`

# EcoLaundry Web App

An eco-friendly on-demand laundry booking web application.

## Features

- Single-page application with responsive design
- On-demand laundry booking system
- Clean and minimalist UI with eco-friendly theme
- Mobile-friendly interface

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the app locally:
   ```
   npm run dev
   ```
4. Visit `http://localhost:8080` in your browser

## Deployment to Google Cloud App Engine

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. Initialize gcloud:
   ```
   gcloud init
   ```

3. Select your Google Cloud project:
   ```
   gcloud config set project YOUR_PROJECT_ID
   ```

4. Deploy the app:
   ```
   gcloud app deploy
   ```

5. Access your deployed app:
   ```
   gcloud app browse
   ```

## Project Structure

- `app.js` - Express server and API endpoints
- `public/index.html` - Single-page application HTML
- `public/css/style.css` - Styling
- `public/js/main.js` - Frontend JavaScript
- `app.yaml` - Google Cloud App Engine configuration 
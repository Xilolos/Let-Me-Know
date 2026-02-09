# Let Me Know (lmk)

**Let Me Know** is an AI-powered personal web monitor that acts as your dedicated agent for tracking information online. Whether you're waiting for a product to come back in stock, monitoring news on a specific topic, or tracking schedule changes, **Let Me Know** handles it for you.

Using advanced AI (Google Gemini), it intelligently parses web content to find exactly what you're looking for and notifies you the moment there's an update.

## 🚀 Key Features

*   **🤖 AI Watchers**: Create intelligent agents that understand natural language queries to monitor any URL or topic.
*   **⏱️ Smart Scheduling**: Set custom check intervals (e.g., every 15 minutes, hourly, daily) to suit your needs.
*   **🔔 Instant Notifications**: Get alerted immediately when relevant information is found.
*   **🌑 Beautiful UI**: A clean, modern interface with support for **Light**, **Dark**, and **AMOLED** themes.
*   **🔒 Private & Local**: Your data stays with you.

## 📸 Screenshots

| Dashboard | Create Watcher |
|:---:|:---:|
| ![Dashboard](./public/screenshots/home_page.webp) | ![Create](./public/screenshots/create_watcher_page.webp) |
| **Track all your active watchers in one place.** | **Easily set up new monitors with natural language.** |

| Results | Settings |
|:---:|:---:|
| ![Results](./public/screenshots/notifications_page.webp) | ![Settings](./public/screenshots/settings_page.webp) |
| **Review notifications and findings.** | **Customize intervals and app appearance.** |

## 🛠️ How It Works

1.  **Create a Watcher**: Tell the AI what you want to track (e.g., *"Notify me when tickets for the glimmer tour become available"*). You can provide a specific URL or let the AI search for you.
2.  **Monitor**: The app runs in the background, periodically checking the source at your specified interval.
3.  **Get Notified**: When the AI detects the information you're looking for, it logs a result and notifies you.

## 💻 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **AI Engine**: [Google Gemini](https://deepmind.google/technologies/gemini/)
*   **Database**: [SQLite](https://www.sqlite.org/) with [Drizzle ORM](https://orm.drizzle.team/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Deployment**: Easy to deploy on Vercel or self-host.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Environment Variables

Make sure to set up your `.env.local` file with the necessary keys (e.g., `GOOGLE_API_KEY` for Gemini). See `.env.example` for reference.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

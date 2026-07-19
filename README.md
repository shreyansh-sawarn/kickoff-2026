# 🏆 Kickoff 2026

Welcome to the **Kickoff 2026** monorepo! This is a comprehensive platform for the FIFA World Cup 2026, providing real-time statistics, player leaderboards, team profiles, and tournament brackets across both web and mobile platforms.

This project is built using [Turborepo](https://turbo.build/repo), allowing seamless code sharing between our Next.js web application and Expo React Native mobile app.

---

## 🏗️ Project Structure

This Turborepo includes the following applications and packages:

### Apps

- **`web`**: A high-performance [Next.js](https://nextjs.org/) web application. It features dynamic scoreboards, player leaderboards (Golden Boot, Assist Kings, etc.), match schedules, and interactive brackets.
- **`mobile`**: A cross-platform mobile application built with [Expo](https://docs.expo.dev/) and [React Native](https://reactnative.dev/).

### Shared Packages

- **`@wc26/api`**: Shared API services and data fetching logic.
- **`@wc26/types`**: Shared TypeScript definitions and interfaces used across the entire monorepo.
- **`@wc26/utils`**: Shared utility functions and helpers.
- **`@repo/ui`**: A shared UI component library.
- **`@repo/typescript-config`**: Base `tsconfig.json` files for consistent typing across the monorepo.

---

## 🚀 Tech Stack

- **Frameworks:** Next.js (Web), Expo / React Native (Mobile)
- **Language:** 100% TypeScript
- **Styling:** Tailwind CSS (Web), StyleSheet (Mobile)
- **Monorepo Tooling:** Turborepo, pnpm
- **Code Quality:** ESLint, Prettier
- **Testing:** Playwright (Web e2e)

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v11+)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd kickoff-2026
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

### Running the Project Locally

To start all applications (web and mobile) simultaneously in development mode, run:

```sh
pnpm dev
```

Alternatively, you can start individual apps using Turborepo's filter flag:

```sh
# Start only the web app
pnpm turbo run dev --filter=web

# Start only the mobile app
pnpm turbo run dev --filter=mobile
```

### Build & Deploy

To build all apps and packages for production:

```sh
pnpm build
```

---

## 📜 Available Scripts

From the root directory, you can run the following commands:

- `pnpm dev` - Starts the development servers for all apps.
- `pnpm build` - Builds all apps and packages.
- `pnpm clean` - Cleans build artifacts and `node_modules`.
- `pnpm format` - Formats all code using Prettier.

---

Made with ❤️ by Shreyansh

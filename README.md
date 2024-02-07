## Rimdian App Template

This is a default template for Rimdian private apps. You can use this NextJS template to create a new app.

Rimdian apps are meant to be loaded in the Rimdian UI Console as an iframe, and should be served over SSL.

### Private apps capabilities

- Load their own UI (iframe) in the Rimdian UI Console.
- Access the Rimdian API.
- Import data to the Rimdian Collector.
- Have their own tables in the Rimdian database.
- Add extra columns to existing tables.
- Register manual or recurring tasks.
- Register data hooks to receive incoming data events in real-time.
- Execute pre-defined SQL queries or have full DB access.
- Manage their own JSON state to store credentials or other data.

### Getting Started

Start by cloning the repository and installing the dependencies:

```bash
git clone
cd rimdian-app-template
yarn install
```

Then, run the development server:

```bash
yarn dev
```

### Create a Service Account

To give your app access to the Rimdian API, you need to create a service account in the Rimdian UI Console, at the organization level.

Then, you can use the Service Account email & password to login in order to receive an API `access_token`.

The dev server will start with SSL. You can access the app at [https://localhost:3000](https://localhost:3000).

### App architecture

- `manifest.json` - A default app manifest that describes the app and its capabilities.
- `src/pages/api/*` - [API routes](https://nextjs.org/docs/api-routes/introduction) for the backend API. It receives tasks & data_hooks webhhooks from Rimdian.
- `src/app/*` - The app UI that will be loaded in the Rimdian UI Console as an iframe.
- `src/app/actions.ts` - [Server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) that are be exposed to the app UI, to query the Rimdian API.
- `.env.local` - The environment variables that are used in the app (your secret app key & DB credentials).

### How to install the app in Rimdian

1. Your app should be hosted over SSL.
2. Create a new private app in the Rimdian UI Console, provide your app secret key & load your `manifest.json`.
3. The app will load in Rimdian and you will be able to interact with it.

### Stack

- [Next.js](https://nextjs.org/)
- [Ant Design](https://ant.design/)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)

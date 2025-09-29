# PortalJS OpenMetadata Frontend Starter

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/datopian/portaljs-frontend-starter)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Next.js 13+](https://img.shields.io/badge/Next.js-13%2B-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![GitHub Stars](https://img.shields.io/github/stars/datopian/portaljs?style=social)](https://github.com/datopian/portaljs/stargazers)

**Adaptation of the [PortalJS Frontend Starter template](https://github.com/datopian/portaljs-frontend-starter) that works with Open Metadata**

Powered by **[Next.js](https://nextjs.org)**, **[React](https://react.dev/)**, and **[Tailwind CSS](https://tailwindcss.com/)**

**[🚀 Live Demo](https://portaljs-cloud-frontend-template.vercel.app/) • [📖 Documentation](https://portaljs.com/docs) • [☁️ PortalJS Cloud](https://cloud.portaljs.com/) • [🌐 Website](https://portaljs.com/)**

</div>

---

## Overview

This template adapts the [PortalJS Frontend Starter template](https://github.com/datopian/portaljs-frontend-starter) so that it can be used with Open Metadata instead of CKAN.

> [!NOTE]
> Currently, it serves mainly as a public PoC. Soon, we plan on moving this support to the main template.

Use it to build decoupled Open Metadata public frontends with modern tools (Next.js, React, TailwindCSS)

## Important Notes

- This template abstracts the OMD taxonomy into a CKAN-like taxonomy:
  - OMD Data Products are mapped to PortalJS Datasets
  - OMD Domains are mapped to PortalJS Organizations
  - The PortalJS Groups and Visualizations concepts have been removed
- Currently, only Table assets can be previewed (this can be extended)
- The template will fetch all Data Products and Domains from your OMD instance unconditionally. Conditions can be added either via BOT authorization rules or by modifying the data fetching queries.

## ✨ Features

- **Modern UI** - Clean, responsive design with Tailwind CSS
- **High Performance** - Built on Next.js 13+ with SSR/SSG
- **Open Metadata Integration** - Seamless data fetching
- **TypeScript** - Full type safety and better DX
- **Easy Customizatio**n - Simple theme system and component styling
- **Mobile-First** - Responsive design for all devices
- **Deploy Ready** - One-click deployment to Vercel

## Getting started

### Development

1) Clone this repository

2) Install the dependencies with `npm i`

3) Run `docker compose -f docker-compose-postgres.yml up` to start a local Open Metadata instance for development (NOTE: the local OMD instance comes with a Postgres database, which is automatically seeded with some dummy data)

4) Navigate to `http://localhost:8585` and sign in to OMD with username `admin@open-metadata.org` and password `admin`.

5) Create a new BOT for the frontend, and copy its access token

6) Create a new `.env` file with:

```bash
# This is the URL of the OMD instance. 
NEXT_PUBLIC_DMS=http://localhost:8585

# This is the access token of the bot
DMS_TOKEN=<bot-token>
```

7) Run `npm run dev` to start the development server

8) Access `http://localhost:3000` in your browser

9) Set up a new Postgres database service for the dummy data. Navigate to Settings > Services > Database > Add New Service, choose Postgres, and use the following info:

```bash
username: openmetadata_user
password: password
host and port: postgresql:5432
database: postgres
```

10) Once OMD has fetched the assets from the dummy data database, create Domains and Data Products to serve as your instances data

## Customization

This template was developed with Next.js/React and TailwindCSS.

In order to learn more about how it can be customized, check the following documentations:

- https://react.dev/
- https://nextjs.org/docs
- https://v3.tailwindcss.com/docs/installation

### Quick Customizations

#### Logo Customization

```tsx
// components/_shared/PortalDefaultLogo.tsx
export default function PortalDefaultLogo() {
  return (
    <Link href="/">
      <img src="/your-logo.png" alt="Your Portal" height={55} />
    </Link>
  );
}
```

#### Footer Links

```tsx
// components/_shared/Footer.tsx - Update navigation object
const navigation = {
  about: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  useful: [
    { name: "Datasets", href: "/search" },
    { name: "Organizations", href: "/organizations" },
  ],
  social: [
    { name: "twitter", href: "https://twitter.com/yourhandle" },
    { name: "email", href: "mailto:contact@yoursite.com" },
  ],
};
```

#### Homepage Content

```tsx
// pages/index.tsx - Update title and description
<Head>
  <title>Your Portal Name</title>
  <meta name="description" content="Your portal description" />
</Head>
```

##### Dataset Search

```tsx
// lib/queries/dataset.ts - Add custom facet fields
const facetFields = [
  "groups",
  "organization",
  "res_format",
  "tags",           // Enable tags
  "license_id",     // Add license filtering
]
```

#### Theme Components

```tsx
// themes/default/index.tsx - Replace with custom components
const DefaultTheme = {
  header: CustomHeader,
  footer: CustomFooter,
  layout: DefaultThemeLayout,
};
```

---

## Tech Stack

- **Framework:** [Next.js 13+](https://nextjs.org/) with TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Data:** [CKAN API](https://docs.ckan.org/en/2.10/api/) via [@portaljs/ckan](https://www.npmjs.com/package/@portaljs/ckan)
- **Deployment:** [Vercel](https://vercel.com/)

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Need help or advanced features?

This template covers basic portal functionality. For complex customizations, integrations, or enterprise features, [contact our team](mailto:portaljs@datopian.com) for professional services.

- **Custom Design** - Tailored branding and UI/UX
- **Advanced Features** - Custom integrations and functionality
- **Enterprise Support** - Dedicated support and SLA
- **Migration** - Help moving from existing portals

---

<div align="center">

**Built with ❤️ by [Datopian](https://datopian.com/)**

Let’s build better data portals together 🚀

**⭐️ [Star PortalJS](https://github.com/datopian/portaljs) • [🐦 Follow us](https://www.linkedin.com/company/10340373) • [💬 Contact](mailto:portaljs@datopian.com)**

**[📚 Docs](https://portaljs.com/docs) • [ 🐛 Report a bug or suggest an idea](https://github.com/datopian/portaljs/issues)**

</div>

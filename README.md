# Salvatore Cannavale — Portfolio

An English-language Next.js portfolio connecting marine operations, problem solving, software and AI-assisted development. Includes Hero, Journey, Build/Codex, Projects, Capabilities, Contact and footer. The business-management case study remains an outline. No AI assistant or additional project pages are included.

## Run and validate

Requires Node.js 20.9+ and npm. Use the committed lockfile.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For validation and a production preview:

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

## Architecture and editable content

- `src/app`: App Router pages, metadata, favicon and shared design tokens.
- `src/components/sections`: narrative sections and scoped styles.
- `src/components/navigation`: navigation and footer.
- `src/components/build`: interactive development route and case-study dialog.
- `src/components/projects`: system map, screenshot gallery and lightbox.
- `src/components/visuals`: SVG charts and destination route.
- `src/components/ui`: shared arrows.
- `src/data/portfolio.ts`: personal positioning and navigation.
- `src/data/journey.ts`, `build.ts`, `projects.ts`, `capabilities.ts`: editable narrative content.
- `src/data/contact.ts`: email, GitHub URL, LinkedIn URL and CV path.

The site reuses Manrope, the approved palette and route motifs. Fonts are self-hosted. SVG artwork is deterministic, not geographic or live operational data. Interactivity is isolated in client components. The final route animation runs once on entry and respects reduced motion. No new dependencies or external services are required.

## Placeholders to replace

1. Set `email`, `githubUrl`, `linkedinUrl` and `cvPath` in `src/data/contact.ts`. Null values display unavailable actions. Use real HTTPS profile URLs.
2. Put your actual CV in `public/cv/`, then set its root-relative path, such as `/cv/your-file.pdf`. Only set the path when the file exists.
3. Add real screenshots in `public/projects/business-management/` and update `businessScreenshots` in `src/data/projects.ts`. Its directory README documents the seven views. Keep missing images null; do not use fabricated screenshots.
4. Confirm `businessModules` feature statuses in `src/data/projects.ts`: `Implemented`, `In development`, `Planned`, or `null` for unverified.
5. The existing `/projects/business-management-system` page is a labelled outline. The detailed case study is still to document.

The application can deploy with these placeholders, but contact actions remain disabled until configured.

## Deploy to Vercel

Run from the project directory containing `package.json`:

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npx vercel@latest login
npx vercel@latest link
```

Choose your account/team, create a new project (or deliberately select an existing one), and use `.` as the source directory. Accept the Next.js preset and default build/output settings. The build command is `npm run build`. No environment variables are required.

Publish when ready:

```sh
npx vercel@latest deploy --prod
```

Open the returned URL and verify configured Contact actions, CV download, mobile navigation, Build interactions, screenshot inspection and the case-study route. For a custom domain, use the project's Settings → Domains and apply the DNS records Vercel supplies.

Official guide: https://vercel.com/docs/projects/deploy-from-cli

Alternatively, push the source and lockfile to a Git repository, then choose Add New → Project in Vercel, import that repository, select the directory containing `package.json`, accept the Next.js preset and Deploy. `node_modules`, `.next`, `.vercel`, `work` and `outputs` are excluded by `.gitignore`.

Git guide: https://vercel.com/docs/git

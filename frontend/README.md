This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## UI Components

### ModalTemplate

`components/modalTemplate.tsx` exposes a reusable modal shell with the Kash gradient border, solid background, title/subtitle slots, and a CTA button anchored to the lower-right corner. The body area accepts arbitrary children so individual flows can inject their own forms or messaging.

Basic usage:

```tsx
import { useState } from 'react';
import ModalTemplate from '@/components/modalTemplate';

const Example = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <ModalTemplate
        isOpen={open}
        title="Fund escrow"
        subtitle="Double-check the numbers before continuing."
        actionLabel="Confirm"
        onAction={() => {
          // handle submit
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      >
        <p className="text-normal">
          Custom content (forms, inputs, etc.) goes here.
        </p>
      </ModalTemplate>
    </>
  );
};
```

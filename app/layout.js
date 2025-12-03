import '../styles/index.css';

export const metadata = {
  title: 'My App',
  description: 'Next.js + Tailwind',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

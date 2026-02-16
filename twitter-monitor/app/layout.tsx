export const metadata = {
  title: 'Twitter Monitor - X.com Content Monitoring',
  description: 'Automated Twitter/X monitoring with keyword-based relevance filtering',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

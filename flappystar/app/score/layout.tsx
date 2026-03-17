import '@/app/globals.css';

export default function ScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-white">
        {/* Starfield background */}
        <div className="starfield" />
        {children}
      </body>
    </html>
  );
}

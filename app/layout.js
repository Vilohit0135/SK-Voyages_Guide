import "./globals.css";

export const metadata = {
  title: "Travellink · Manuals",
  description: "Dashboard and app manuals for the Travellink platform"
};

// The header is dark in both themes, so the browser chrome matches it.
export const viewport = {
  themeColor: "#0e2a44"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

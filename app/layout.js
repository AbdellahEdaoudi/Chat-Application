import { Inter, Prompt } from "next/font/google";
import "./globals.css";
import { MyProvider } from "./Context/MyContext";
import { ToastProvider } from "./Components/toast";

const inter = Inter({ subsets: ['latin'] });
const prompt = Prompt({ subsets: ['latin'], weight: '400' });

export const metadata = {
  metadataBase: new URL("https://edchatflow.com"),
  title: {
    default: "Edchatflow - Secure & Seamless Messaging",
    template: "%s | Edchatflow",
  },
  description: "Edchatflow is a secure, real-time messaging platform enabling seamless communication. Connect globally with end-to-end encryption and a user-friendly interface.",
  keywords: ["Edchatflow", "secure chat", "encrypted messaging", "real-time chat", "communication platform", "private messaging", "online chat", "web chat app"],
  authors: [{ name: "Abdellah Edaoudi" }],
  creator: "Abdellah Edaoudi",
  publisher: "Edchatflow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Edchatflow - Secure & Seamless Messaging",
    description: "Connect securely with Edchatflow. Real-time messaging with end-to-end encryption.",
    url: "https://edchatflow.com",
    siteName: "Edchatflow",
    images: [
      {
        url: "/favlogo.png",
        width: 800,
        height: 600,
        alt: "Edchatflow Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edchatflow - Secure Messaging",
    description: "Join Edchatflow for secure, seamless, and real-time communication.",
    images: ["/favlogo.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favlogo.png",
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      </head>
      <body className={`${prompt.className} scrollbar-none bg-gradient-to-r from-blue-500 to-purple-500`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Edchatflow",
              "applicationCategory": "CommunicationApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
              },
            }),
          }}
        />
        <ToastProvider>
          <MyProvider>
            {children}
          </MyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

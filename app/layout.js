import { Inter, Prompt } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./Components/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { MyProvider } from "./Context/MyContext";

const inter = Inter({ subsets: ['latin'] });
const prompt = Prompt({ subsets: ['latin'], weight: '400' });

export const metadata = {
  title: "ChatApp",
  description: "ChatApp is an innovative communication platform that allows seamless conversations across languages. Connect, communicate, and share your thoughts effortlessly.",
  keywords: "ChatApp, communication platform, language translation, messaging app, social media integration, chat application, online communication, real-time messaging, multilingual chat",
  author: "Abdellah Edaoudi",
  robots: "index, follow", 
  viewport: "width=device-width, initial-scale=1.0",
};




export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
      <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      </head>
        <body className={`${prompt.className} scrollbar-none bg-gradient-to-r from-blue-500 to-purple-500`}>
        <MyProvider>
        <div className="sticky top-0 z-50">
          <Navbar />
          </div>
            {children}
        </MyProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

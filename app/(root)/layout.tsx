import { ClerkProvider } from "@clerk/nextjs"
import {Inter} from "next/font/google"
import Bottombar from "@/components/shared/Bottombar"
import Topbar from "@/components/shared/Topbar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import RightSideBar from "@/components/shared/RightSidebar"

import '../globals.css'

export const metadata = {
    title: 'Threads',
    description: 'A Next.js Meta Threads Application'
}

const inter = Inter({subsets: ["latin"]})

export default function RootLayout({
    children
}: {children : React.ReactNode}) 
{
    return (
    <ClerkProvider>
        <html lang="en">
            <body className = {`${inter.className}`}>
                <Topbar/>
                <main className="flex flex=row">
                  <LeftSidebar/>
                  <section className="main-container">
                    <div className="w-full max-w-4xl">
                      {children}
                    </div>
                  </section>
                  <RightSideBar/>
                </main>
                <Bottombar/>
            </body>
        </html>
    </ClerkProvider>
    )
}
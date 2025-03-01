import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/shared/header";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = auth();
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
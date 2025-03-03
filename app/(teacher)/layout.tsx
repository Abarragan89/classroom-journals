import Footer from "@/components/footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    );
}
import { signIn } from "@/auth"
export default function page() {

    return (
        <main>
            <form
                action={async () => {
                    "use server"
                    await signIn("google")
                }}
            >
                <button type="submit">Signin with Google</button>
            </form>
        </main>
    )
}
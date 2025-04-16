// lib/stripe/checkout.ts
export async function checkout({ priceId }: { priceId: string }) {
    const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data?.url) {
        window.location.href = data.url;
    } else {
        alert("Something went wrong!");
    }
}
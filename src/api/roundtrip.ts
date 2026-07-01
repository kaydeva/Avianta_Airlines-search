import axios from "axios";


export async function searchRoundtrip(origin: string, destination: string, departDate: string, returnDate: string) {
    try {
        const response = await axios.get("http://localhost:5000/api/roundtrip", {
            params: {
                origin: origin.toUpperCase().trim(),
                destination: destination.toUpperCase().trim(),
                departDate,
                returnDate,
            },
        });

        return response.data;
    } catch (err) {
        console.error("Roundtrip API error:", err);
        throw new Error("Failed to fetch roundtrip flights.");
    }
}

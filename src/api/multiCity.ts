import axios from "axios";


export async function searchMulticity(segments: any[]) {
    try {
        const response = await axios.post(
            "http://localhost:5000/api/multicity",
            {
                segments,
            }
        );

        return response.data;
    } catch (err) {
        console.error("Multicity API error:", err);
        throw new Error("Failed to fetch multicity flights.");
    }
}


import axios from "axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchDataWithRetry = async (url, retries = 5, signal = null) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, signal ? { signal } : {});
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error(`Attempt ${attempt} failed for ${url}`, error);
            if (attempt < retries) await delay(500);
            else console.error(`Failed to fetch after ${retries} attempts: ${url}`);
        }
    }
    return null;
};

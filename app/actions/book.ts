"use server";
import { revalidatePath } from "next/cache";
import { createBookRecommendation, deleteBookRecommendation } from "../api/book";
import { BookRecommendation } from "../_types/book";
import { getSession } from "../_lib/session";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export type ActionState = {
    error?: string;
    success?: string;
};

// Function to fetch recommendations from Django API
const fetchRecommendationsFromDjango = async (query: string, userId: string): Promise<BookRecommendation[]> => {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
        const response = await axios.post(`${backendUrl}/api/recommend/query/`, {
            query: query,
            top_k: 5
        });

        const recommendations: any[] = response.data.recommendations;

        return recommendations.map(rec => ({
            id: uuidv4(),
            title: rec.title,
            author: rec.author || "Unknown Author",
            description: rec.description || rec.reason || "No description available.",
            query: query,
            userId: userId,
            recommendationDate: new Date().toISOString()
        }));
    } catch (error) {
        console.error("Error fetching from Django API:", error);
        throw error;
    }
};

export const searchBooksAction = async (
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> => {
    const user = await getSession();
    if (!user) {
        return { error: "User not authenticated" };
    }

    const query = formData.get("query") as string;
    if (!query || query.trim().length === 0) {
        return { error: "Please enter a search query" };
    }

    try {
        const recommendations = await fetchRecommendationsFromDjango(query, user.id.toString());

        if (recommendations.length === 0) {
            return { error: "No recommendations found. Try a different query." };
        }

        // Store all recommendations
        await Promise.all(recommendations.map(book => createBookRecommendation(book)));

        revalidatePath("/books");
        return { success: `Generated ${recommendations.length} recommendations for "${query}"` };
    } catch (error) {
        console.log("error generating book recommendations", error);
        return { error: "Error generating recommendations from AI" };
    }
}

export const saveRecommendationsAction = async (
    query: string,
    recommendationsJson: string
): Promise<ActionState> => {
    const user = await getSession();
    if (!user) return { error: "User not authenticated" };

    try {
        // Parse the JSON list of reasons
        let reasons: string[] = [];
        try {
            const cleanJson = recommendationsJson.replace(/```json/g, "").replace(/```/g, "").trim();
            reasons = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse streamed JSON:", e);
            return { error: "Failed to parse AI response" };
        }

        // We still need to fetch the similar books from Django to get the titles/authors
        // Or better, let's just use the fetchRecommendationsFromDjango which already does this.
        // Wait, if we use fetchRecommendationsFromDjango, we are re-calling the LLM. 
        // We need a way to save WITHOUT re-calling the LLM.

        // I'll add a new function for that.
        const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
        // Let's assume there's a way to get just the similar books.
        // For now, I'll stick to a slightly less efficient way: re-querying but with the cached results if possible.

        const recommendations = await fetchRecommendationsFromDjango(query, user.id.toString());
        await Promise.all(recommendations.map(book => createBookRecommendation(book)));

        revalidatePath("/books");
        return { success: `Saved ${recommendations.length} recommendations` };
    } catch (error) {
        return { error: "Error saving recommendations" };
    }
}

export const deleteBookAction = async (
    prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> => {
    const id = formData.get("id") as string;
    try {
        await deleteBookRecommendation(id);
        revalidatePath("/books");
        return { success: "Recommendation removed" };
    } catch (error) {
        console.log("error deleting book", error);
        return { error: "Error removing recommendation" };
    }
}
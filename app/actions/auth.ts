"use server"

import axios from "axios"
import { UserType } from "../_types/user"
import { redirect } from "next/navigation"
import { setSession, deleteSession } from "../_lib/session"

const API_URL = "http://localhost:3002"

export const loginAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email, password)
    try {
        const response = await axios.get(`${API_URL}/users?email=${email}&password=${password}`)
        const user: UserType = response.data[0]
        if (!user) {
            throw new Error("User not found")
        }
        //set user in the cookies
        //await setSession(user)
        await setSession(user.name, user.email, user.id.toString())
        redirect("/books")
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error("Fail to login");
        }
        throw error;
    }
}

export const logoutAction = async () => {
    // json-server filtering doesn't have a logout endpoint, so we just redirect
    await deleteSession()
    redirect("/login")
}
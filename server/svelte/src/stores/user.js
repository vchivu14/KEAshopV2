import { writable, readable } from "svelte/store";

// This will export a writable store with the value of the user item in localStorage if present or null.
export const user = writable(
    localStorage.user ? JSON.parse(localStorage.getItem("user")) : null
)
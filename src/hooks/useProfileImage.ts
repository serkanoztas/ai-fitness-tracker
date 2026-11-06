"use client";

import { useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "userProfileImage";
const UPDATE_EVENT = "profileImageUpdated";

function subscribe(onChange: () => void) {
    // Profil sayfası aynı sekmede custom event, diğer sekmeler 'storage' event'i ile haber verir
    window.addEventListener(UPDATE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        window.removeEventListener(UPDATE_EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
}

const getSnapshot = () => localStorage.getItem(STORAGE_KEY);
// Sunucuda ve hydration sırasında localStorage yoktur -> hydration uyuşmazlığı olmaz
const getServerSnapshot = () => null;

/** Profil resmini döndürür: önce localStorage, yoksa session. */
export function useProfileImage() {
    const { data: session } = useSession();
    const storedImage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return storedImage || session?.user?.image || null;
}

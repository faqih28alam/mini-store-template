"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Optional: Listen for auth changes (login/logout) to update UI automatically
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}

export function useRole() {
    const { user, loading: userLoading } = useUser();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRole = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user?.id)
                    .single(); // Use .single() because ID is unique
                if (error) throw error;
                setRole(data?.role || null);
            } catch (error) {
                console.error("Error fetching role:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading) {
            if (user) {
                fetchRole();
            } else {
                setRole(null);
                setLoading(false);
            }
        }
    }, [user, userLoading, supabase]);

    return { role, loading: loading || userLoading };
}
"use client";

// import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

type Provider = "google" | "facebook";

export default function OAuth() {
    const supabase = createClient();

    const handleOAuth = async (provider: Provider) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            // options: { redirectTo: `${window.location.origin}/products` },
            options: { redirectTo: `http://localhost:3000/products` },
        });
        if (error) console.error(`${provider} login error:`, error.message);
    };

    useEffect(() => {
        if (window.location.hash === "#_=_") {
            history.replaceState
                ? history.replaceState(null, "", window.location.href.split("#")[0])
                : (window.location.hash = "");
        }
    }, []);

    return (
        <div className="flex flex-wrap gap-5">
            <section
                onClick={() => handleOAuth("google")}
                className="flex-1 h-12 text-xl flex items-center justify-center gap-2 border rounded-lg hover:bg-gray-100/50 hover:cursor-pointer"
            >
                <FcGoogle className="w-7 h-7" />
                <span className="font-semibold dark:text-white">Google</span>
            </section>

            {/* <section
        onClick={() => handleOAuth("facebook")}
        className="flex-1 h-12 text-xl flex items-center justify-center gap-2 border rounded-lg hover:bg-gray-100/50 hover:cursor-pointer"
      >
        <FaFacebook className="h-7 w-7 text-blue-600" />
        <span className="font-semibold dark:text-white">Facebook</span>
      </section> */}
        </div>
    );
}
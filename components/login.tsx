import { useLoaderData, useOutletContext } from "@remix-run/react";
// import supabase from "utils/supabase.server";
import type { SupabaseOutletContext } from "~/root";

export default function Login() {

    const { supabase } = useOutletContext<SupabaseOutletContext>();
    // console.log('supabase1', supabase);

    const handleLogin = async () => {

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
        });
        if (error) console.error("Error logging in:", error.message);
    }

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error logging out:", error.message);
    }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleLogin}>Login</button>
    </div>
  );
}
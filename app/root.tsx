import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "db_types";
import createServerSupabase from "utils/supabase.server";
import { createBrowserClient } from "@supabase/auth-helpers-remix";


type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient
};


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();

  const supabase = createServerSupabase({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  console.log({ server: { session}});

  const [supabase] = useState(() => {
    return createBrowserClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
    );
  });

  const serverAccessToken = session?.access_token;
  const revalidator = useRevalidator();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth
    .onAuthStateChange((event, session) => {
      if ( session?.access_token !== serverAccessToken ) {
        // call loader
        revalidator.revalidate();
      }
    });

    return () => {
      subscription?.unsubscribe();
    }
  }, [supabase, serverAccessToken, revalidator]);

  return <Outlet context={{supabase}} />;
}

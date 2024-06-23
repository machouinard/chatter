import createServerSupabase from "utils/supabase.server";
import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import Login from "components/login";
import RealtimeMessages from "components/realtime-messages";

export const action = async ({request}: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({request, response});
  const { message } = Object.fromEntries( await request.formData() );
  const { error } = await supabase.from("messages").insert({ content: String(message) });
  // if (error) {
  //   console.log('error', error);
  //   throw error;
  // }
  return json( null, { headers: response.headers });
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({request, response});
  const { data, error } = await supabase.from("messages").select("*");
  if (error) {
    throw error;
  }
  return json({ messages: data ?? [] }, { headers: response.headers });
}



export default function Index() {

  const { messages } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <Login />
      <RealtimeMessages 
        serverMessages={messages}
      />
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Add Message</button>
      </Form>
    </div>
  );
}

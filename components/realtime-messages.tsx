import { useOutletContext } from "@remix-run/react";
import type { Database } from "db_types";
import { useEffect, useState } from "react";
import { SupabaseOutletContext } from "~/root";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function RealtimeMessages({ serverMessages }: { serverMessages: Message[] }) {

    const [messages, setMessages] = useState<Message[]>(serverMessages);
    const { supabase } = useOutletContext<SupabaseOutletContext>();

    useEffect(() => {
        setMessages(serverMessages);
    }, [serverMessages]);

    useEffect(() => {
        const channel = supabase.channel('*')
            .on(
                "postgres_changes",
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    console.log('payload', payload);
                    const newMessage = payload.new as Message;
                    if ( !messages.find( message => message.id === newMessage.id ) ) {
                        setMessages([...messages, newMessage]);
                    };
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, messages, setMessages]);

    return (
        <div>
            <h2>Realtime Messages</h2>
            <ul>
                {messages.map((message) => (
                    <li key={message.id}>{message.user_id} - {message.content}</li>
                ))}
            </ul>
        </div>
    );
}
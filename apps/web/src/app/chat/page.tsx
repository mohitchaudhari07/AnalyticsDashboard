"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ChatWithData() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat-with-data`, { prompt: query });
      setResponse(res.data);
    } catch {
      setResponse({ error: "Failed to fetch response" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chat with Data</h1>
      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about your data..." />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>

      {response && (
        <Card className="p-4">
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}

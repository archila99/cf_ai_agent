import { StrictMode, useMemo, useState } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import type { UIMessage } from "ai";
import type { CounterAgent, CounterState, ChatAgent } from "./server";
import { createRoot } from "react-dom/client";
import "./styles.css";

function CounterPanel() {
  const [count, setCount] = useState(0);

  const agent = useAgent<CounterAgent, CounterState>({
    agent: "CounterAgent",
    onStateUpdate: (state) => setCount(state.count)
  });

  return (
    <section className="panel">
      <header className="panelHeader">
        <div>
          <h1 className="title">Counter</h1>
          <p className="subtitle">Durable Object state + @callable() methods</p>
        </div>
      </header>

      <div className="counterValue">{count}</div>

      <div className="row">
        <button className="btn" onClick={() => agent.stub.decrement()}>
          -
        </button>
        <button className="btn btnSecondary" onClick={() => agent.stub.reset()}>
          Reset
        </button>
        <button className="btn" onClick={() => agent.stub.increment()}>
          +
        </button>
      </div>
    </section>
  );
}

type ToolPart = {
  type: "tool";
  toolCallId: string;
  toolName: string;
  state: "approval-requested" | "output-available" | "output-denied";
  approval?: { id?: string };
  input?: unknown;
  output?: unknown;
};

function ChatPanel() {
  const [input, setInput] = useState("");

  const agent = useAgent<ChatAgent>({
    agent: "ChatAgent"
  });

  const {
    messages,
    sendMessage,
    clearHistory,
    addToolApprovalResponse,
    status
  } = useAgentChat({
    agent,
    onToolCall: async (event) => {
      if (
        "addToolOutput" in event &&
        event.toolCall.toolName === "getUserTimezone"
      ) {
        event.addToolOutput({
          toolCallId: event.toolCall.toolCallId,
          output: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toLocaleTimeString()
          }
        });
      }
    }
  });

  const canSend = useMemo(() => {
    return input.trim().length > 0 && status !== "streaming";
  }, [input, status]);

  return (
    <section className="panel">
      <header className="panelHeader">
        <div>
          <h1 className="title">Chat</h1>
          <p className="subtitle">Workers AI streaming + tools + approval</p>
        </div>
      </header>

      <div className="chatBox">
        {messages.map((msg: UIMessage, i: number) => (
          <div key={msg.id ?? i} className="msg">
            <div className="msgMeta">{msg.role}</div>
            <div className="msgBody">
              {msg.parts.map((part, idx) => {
                const p = part as unknown as ToolPart;
                if (part.type === "text") {
                  return (
                    <div key={idx} className="bubble">
                      {part.text}
                    </div>
                  );
                }

                if (p.type === "tool" && p.state === "approval-requested") {
                  const approvalId = p.approval?.id ?? p.toolCallId;
                  return (
                    <div key={idx} className="toolCard toolCardWarn">
                      <div className="toolTitle">
                        Approval needed: <code>{p.toolName}</code>
                      </div>
                      <pre className="codeBlock">
                        {JSON.stringify(p.input, null, 2)}
                      </pre>
                      <div className="row">
                        <button
                          className="btn"
                          disabled={!approvalId}
                          onClick={() => {
                            if (!approvalId) return;
                            addToolApprovalResponse({
                              id: approvalId,
                              approved: true
                            });
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btnSecondary"
                          disabled={!approvalId}
                          onClick={() => {
                            if (!approvalId) return;
                            addToolApprovalResponse({
                              id: approvalId,
                              approved: false
                            });
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                }

                if (p.type === "tool" && p.state === "output-available") {
                  return (
                    <details key={idx} className="toolCard">
                      <summary className="toolTitle">
                        Tool result: <code>{p.toolName}</code>
                      </summary>
                      <pre className="codeBlock">
                        {JSON.stringify(p.output, null, 2)}
                      </pre>
                    </details>
                  );
                }

                if (p.type === "tool" && p.state === "output-denied") {
                  return (
                    <div key={idx} className="toolCard toolCardDanger">
                      Tool denied: <code>{p.toolName}</code>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text) return;
          setInput("");
          sendMessage({
            role: "user",
            parts: [{ type: "text", text }]
          });
        }}
        className="chatForm"
      >
        <input
          value={input}
          placeholder="Try: What's the weather in Paris?"
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />
        <button type="submit" disabled={!canSend} className="btn">
          Send
        </button>
        <button
          type="button"
          onClick={clearHistory}
          className="btn btnSecondary"
        >
          Clear
        </button>
      </form>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<"counter" | "chat">("counter");

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">cf_ai_my-agent</div>
        <div className="tabs">
          <button
            className={tab === "counter" ? "tab tabActive" : "tab"}
            onClick={() => setTab("counter")}
          >
            Counter
          </button>
          <button
            className={tab === "chat" ? "tab tabActive" : "tab"}
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
        </div>
      </div>

      <main className="main">
        {tab === "counter" ? <CounterPanel /> : <ChatPanel />}
      </main>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

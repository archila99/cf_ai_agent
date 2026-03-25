# AI Prompts Used (Human-friendly)

These are the prompts (and a bit of context) that I used while building and debugging this project with AI assistance.

## 1) Fix “Method X is not callable” + typing issues

**Context**
I was calling `agent.stub.<method>()` from the React UI and getting “Method X is not callable”, plus some `agent.stub` type issues.

**Prompt**

```text
I’m getting “Method X is not callable” when calling agent.stub.<method>() from the React client.
Can you check my agent + client and fix it so:
- server methods are actually callable from agent.stub
- useAgent is correctly typed (Agent + State generics)
```

**Expected**
Buttons in the UI call the agent methods successfully, and TypeScript types `agent.stub` correctly.

## 2) Fix decorator runtime error for `@callable()`

**Context**
The dev server was failing on decorator syntax.

**Prompt**

```text
My dev server throws “SyntaxError: Invalid or unexpected token” at @callable().
What’s the correct tsconfig setup for the Agents SDK decorators (TC39 decorators)?
```

**Expected**
The app starts locally and `@callable()` works at runtime (without using TypeScript legacy decorators).

## 3) Make the chat UI match the actual agent exports

**Context**
The chat UI expected `ChatAgent` methods, but the server file only exported `CounterAgent`, so things didn’t line up.

**Prompt**

```text
My UI imports ChatAgent from ./server, but my server.ts only exports CounterAgent.
Can you add/restore ChatAgent and update Wrangler bindings so both CounterAgent and ChatAgent work?
```

**Expected**
Both agents exist and can be used locally (counter tab + chat tab) without missing export/binding errors.

## 4) Implement the “counter” + “chat agent with tools” per Cloudflare docs

**Context**
I wanted the project to follow the Cloudflare Agents quick start and chat agent guide: counter state + chat with tools.

**Prompt**

```text
Please implement:
- CounterAgent with persistent state and @callable increment/decrement/reset, plus a React UI using useAgent
- ChatAgent using AIChatAgent + Workers AI streaming, with tools:
  - getWeather (server-side)
  - getUserTimezone (client-side tool)
  - calculate (approval-gated for large numbers)
Also update wrangler.jsonc bindings/migrations and regenerate env.d.ts.
```

**Expected**
Local UI demonstrates both a stateful counter and a streaming chat agent with tools and approval.

## 5) Add minimal tests

**Context**
I needed a small test suite to show the agent can be tested locally.

**Prompt**

```text
Add a minimal Vitest setup for this Workers/Agents project and one test that exercises CounterAgent.
```

**Expected**
`npm test` runs locally and passes.

## 6) Debug blank UI on localhost

**Context**
The dev server said it was “ready”, but the page looked blank in the browser.

**Prompt**

```text
The dev server is “ready”, but the UI is blank in the browser.
Can you debug why and fix the React entry so the UI actually renders?
```

**Expected**
Opening `http://localhost:5173/` shows the UI immediately (not a blank page).

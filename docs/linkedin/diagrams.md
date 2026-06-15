# Lelu LinkedIn Diagrams

---

## Diagram 1 — "How OpenAI Agents integrate with Lelu"
> Paste at https://mermaid.live → Export PNG (1200×628)

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant A as 🤖 OpenAI Agent<br/>(GPT-4o)
    participant SDK as Lelu SDK
    participant E as Lelu Engine
    participant H as 👥 Human Reviewer
    participant T as 🌐 Target System

    U->>A: "Refactor the auth module"
    A->>A: Plans action:<br/>write_file /src/auth.ts
    A->>SDK: authorize(action, resource,<br/>confidence_signal)
    SDK->>E: POST /v1/agent/authorize<br/>{ actor, action, resource,<br/>  confidence_signal: {provider:"openai",<br/>  token_logprobs:[...]} }

    alt Confidence ≥ 85% + policy allows
        E-->>SDK: { allowed: true }
        SDK-->>A: ✅ Proceed
        A->>T: Writes file
    else Confidence 50–85% (uncertain)
        E->>H: Queued for review
        H-->>E: Approve / Deny
        E-->>SDK: { allowed: true/false }
        SDK-->>A: Decision
    else Confidence < 50% (low)
        E-->>SDK: { allowed: false,<br/>reason: "confidence below threshold" }
        SDK-->>A: ❌ Blocked
    end
```

---

## Diagram 2 — "What happens inside Lelu" (pipeline)
> Clean flow showing the 4 layers

```mermaid
flowchart LR
    REQ([🤖 Agent Request]) --> PI

    subgraph ENGINE["⚙️  Lelu Engine"]
        PI["🛡️ Prompt Injection\nDetector"]
        PI --> CG
        CG["📊 Confidence Gate\n(LLM token probs)"]
        CG --> PE
        PE["📋 Policy Evaluator\n(YAML / OPA Rego)"]
        PE --> RM
        RM["⚠️ Risk Model\n(criticality × anomaly)"]
    end

    RM --> DEC{Decision}
    DEC -->|allowed| ACT([✅ Agent acts])
    DEC -->|uncertain| HQ([👥 Human Queue])
    DEC -->|denied| BLK([❌ Blocked + logged])

    style ENGINE fill:#0f172a,color:#e2e8f0,stroke:#6366f1
    style PI fill:#1e1b4b,color:#a5b4fc,stroke:#6366f1
    style CG fill:#1e1b4b,color:#a5b4fc,stroke:#6366f1
    style PE fill:#1e1b4b,color:#a5b4fc,stroke:#6366f1
    style RM fill:#1e1b4b,color:#a5b4fc,stroke:#6366f1
```

---

## Diagram 3 — "Before vs After Lelu" (problem/solution)

```mermaid
flowchart LR
    subgraph BEFORE["❌ Without Lelu"]
        direction TB
        A1[🤖 Agent] -->|no checks| S1[Production DB]
        A2[🤖 Agent] -->|no checks| S2[File System]
        A3[🤖 Agent] -->|no checks| S3[External API]
    end

    subgraph AFTER["✅ With Lelu"]
        direction TB
        B1[🤖 GPT-4o Agent] --> L[⚙️ Lelu\nAuthorization\nEngine]
        B2[🤖 Claude Agent] --> L
        B3[🤖 Custom Agent] --> L
        L -->|allowed| RS1[Production DB]
        L -->|allowed| RS2[File System]
        L -->|blocked| RS3[❌ Denied]
        L -->|review| RH[👥 Human]
    end

    style BEFORE fill:#1c0a0a,stroke:#ef4444
    style AFTER fill:#0a1c0a,stroke:#22c55e
    style L fill:#0f172a,color:#a5b4fc,stroke:#6366f1
```

---

## Diagram 4 — "Confidence Signal explained" (educational)

```mermaid
flowchart TD
    LLM["🧠 LLM (GPT-4o / Claude)"]
    LLM -->|"generates response\n+ token log-probs"| SIG

    subgraph SIG["📊 Confidence Signal"]
        direction LR
        TP["token_logprobs:\n[-0.05, -0.02, -0.08]\n→ score: 94%"]
    end

    SIG --> GATE{Lelu\nConfidence Gate}

    GATE -->|"≥ 85%"| ALLOW["✅ High confidence\nAgent proceeds"]
    GATE -->|"50–85%"| REVIEW["👥 Uncertain\nHuman reviews"]
    GATE -->|"< 50%"| DENY["❌ Low confidence\nHard blocked"]

    style GATE fill:#0f172a,color:#e2e8f0,stroke:#6366f1
    style ALLOW fill:#052e16,color:#86efac,stroke:#22c55e
    style REVIEW fill:#1c1917,color:#fcd34d,stroke:#f59e0b
    style DENY fill:#1c0a0a,color:#fca5a5,stroke:#ef4444
```


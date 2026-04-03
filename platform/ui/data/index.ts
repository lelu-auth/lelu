export const navItems = [
  { name: "About", link: "/about" },
  { name: "Docs", link: "/docs" },
  { name: "Audit Log", link: "/audit" },
  { name: "Policies", link: "/policies" },
  { name: "Safety", link: "/policies/safety" },
];

export const gridItems = [
  {
    id: 1,
    title: "Behavioral Analytics",
    description:
      "Track agent reputation, detect anomalies, and monitor behavior patterns in real-time.",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "w-full h-full opacity-30",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },
  {
    id: 2,
    title: "Predictive Analytics",
    description:
      "ML-powered predictions for confidence scores, human review needs, and policy optimization.",
    className: "lg:col-span-3 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "OpenTelemetry Tracing",
    description:
      "Full distributed tracing with AI-specific semantic conventions for complete observability.",
    className: "lg:col-span-3 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-center",
    img: "",
    spareImg: "",
  },
  {
    id: 5,
    title: "Prompt Injection Detection",
    description:
      "Automatic detection and blocking of prompt injection attacks to keep your agents secure.",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    img: "/b5.svg",
    spareImg: "/grid.svg",
  },
];

export const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "P95 Latency" },
  { value: "100%", label: "Audit Coverage" },
  { value: "SOC 2", label: "Compliant" },
];

export const features = [
  {
    id: 1,
    title: "Policy-Driven Decisions",
    desc: "Lelu applies Rego policies at action time so every tool call can be evaluated in real-time.",
    className: "md:col-span-2",
    thumbnail: "/exp1.svg",
  },
  {
    id: 2,
    title: "Human-in-the-Loop",
    desc: "High-risk actions are automatically paused and routed to human reviewers for ultimate safety.",
    className: "md:col-span-2",
    thumbnail: "/exp2.svg",
  },
  {
    id: 3,
    title: "Tamper-Proof Audit",
    desc: "Every single decision is captured immutably with confidence context and trace IDs for compliance.",
    className: "md:col-span-2",
    thumbnail: "/exp3.svg",
  },
  {
    id: 4,
    title: "Multi-Agent Delegation",
    desc: "Agent swarms can safely mint short-lived tokens to delegate restricted access to sub-agents.",
    className: "md:col-span-2",
    thumbnail: "/exp4.svg",
  },
];

export const testimonials = [
  {
    quote:
      "Lelu has completely transformed how we secure our agent swarms. The policy-as-code approach is exactly what we needed to maintain trust in our autonomous workflows.",
    name: "Alex River",
    title: "Director of Engineering, V-Security",
  },
  {
    quote:
      "Integrating Lelu into our LangChain workflows was seamless. Decisions are gated in milliseconds, ensuring our agents never overstep their bounds.",
    name: "Sarah Chen",
    title: "Senior AI Researcher, AgentX",
  },
  {
    quote:
      "The audit trail and confidence metadata provided by Lelu have made SOC 2 compliance a breeze for our AI platform.",
    name: "David Kim",
    title: "CTO, SafeSwarm AI",
  },
];

export const socialMedia = [
  {
    id: 1,
    img: "/git.svg",
  },
  {
    id: 2,
    img: "/twit.svg",
  },
  {
    id: 3,
    img: "/link.svg",
    link: "https://www.linkedin.com/in/bereketgezha/",
  },
];

export const decisions = [
  {
    id: 1,
    title: "Gated: DB Write Access",
    des: "Policy denied 'marketing-agent' from dropping high-value customer tables.",
    img: "/b1.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg"],
    link: "/audit/1",
  },
  {
    id: 2,
    title: "Escalated: Refund Request",
    des: "Action 'payment:refund' > $1000 automatically routed to human reviewer 'Sarah'.",
    img: "/b4.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg"],
    link: "/audit/2",
  },
  {
    id: 3,
    title: "Allowed: Log Retrieval",
    des: "Short-lived token minted for 'debug-agent' to read application logs safely.",
    img: "/grid.svg",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg"],
    link: "/audit/3",
  },
];

export const companies = [
  {
    id: 1,
    name: "cloudinary",
    img: "/cloud.svg",
    nameImg: "/cloudName.svg",
  },
  {
    id: 2,
    name: "appwrite",
    img: "/app.svg",
    nameImg: "/appName.svg",
  },
  {
    id: 3,
    name: "HOSTINGER",
    img: "/host.svg",
    nameImg: "/hostName.svg",
  },
  {
    id: 4,
    name: "stream",
    img: "/s.svg",
    nameImg: "/streamName.svg",
  },
  {
    id: 5,
    name: "docker.",
    img: "/dock.svg",
    nameImg: "/dockerName.svg",
  },
];

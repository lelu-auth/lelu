"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "h2",
  "h3",
  "section",
  "pre",
  "table",
  "blockquote",
  "ul",
  "ol",
  "div.rounded-xl",
  "div.rounded-2xl",
].join(",");

export function DocsEnhancements() {
  useEffect(() => {
    const root = document.querySelector(".docs-page");
    if (!root) return;

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter(
      (node) => !node.closest("nav")
    );

    revealTargets.forEach((node, index) => {
      node.classList.add("docs-reveal");
      node.style.setProperty("--docs-reveal-delay", `${Math.min(index * 20, 220)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    revealTargets.forEach((node) => observer.observe(node));

    const createdButtons: HTMLButtonElement[] = [];
    const pres = Array.from(root.querySelectorAll<HTMLPreElement>("pre"));

    pres.forEach((pre) => {
      if (pre.dataset.copyAttached === "true") return;

      pre.dataset.copyAttached = "true";
      pre.classList.add("docs-copy-container");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "docs-copy-button";
      button.setAttribute("aria-label", "Copy code");
      button.textContent = "Copy";

      button.addEventListener("click", async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "Copied";
          button.classList.add("is-copied");
          window.setTimeout(() => {
            button.textContent = "Copy";
            button.classList.remove("is-copied");
          }, 1400);
        } catch {
          button.textContent = "Failed";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1400);
        }
      });

      pre.appendChild(button);
      createdButtons.push(button);
    });

    return () => {
      observer.disconnect();
      revealTargets.forEach((node) => {
        node.classList.remove("docs-reveal", "is-visible");
        node.style.removeProperty("--docs-reveal-delay");
      });
      createdButtons.forEach((button) => button.remove());
      pres.forEach((pre) => {
        pre.dataset.copyAttached = "false";
        pre.classList.remove("docs-copy-container");
      });
    };
  }, []);

  return null;
}

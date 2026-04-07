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
      (node) => !node.closest("nav"),
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
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    revealTargets.forEach((node) => observer.observe(node));

    const createdButtons: HTMLButtonElement[] = [];
    const createdWrappers: HTMLDivElement[] = [];
    const pres = Array.from(root.querySelectorAll<HTMLPreElement>("pre"));

    pres.forEach((pre) => {
      if (pre.dataset.copyAttached === "true") return;

      pre.dataset.copyAttached = "true";
      pre.classList.add("docs-copy-container");

      const wrapper = document.createElement("div");
      wrapper.className = "docs-copy-wrapper";

      const parent = pre.parentElement;
      if (!parent) return;
      parent.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      createdWrappers.push(wrapper);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "docs-copy-button";
      button.setAttribute("aria-label", "Copy code");
      button.setAttribute("title", "Copy code");
      button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"></path>
        </svg>
      `;

      button.addEventListener("click", async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          button.classList.add("is-copied");
          button.setAttribute("title", "Copied");
          window.setTimeout(() => {
            button.classList.remove("is-copied");
            button.setAttribute("title", "Copy code");
          }, 1400);
        } catch {
          button.setAttribute("title", "Copy failed");
          window.setTimeout(() => {
            button.setAttribute("title", "Copy code");
          }, 1400);
        }
      });

      wrapper.appendChild(button);
      createdButtons.push(button);
    });

    return () => {
      observer.disconnect();
      revealTargets.forEach((node) => {
        node.classList.remove("docs-reveal", "is-visible");
        node.style.removeProperty("--docs-reveal-delay");
      });
      createdButtons.forEach((button) => button.remove());
      createdWrappers.forEach((wrapper) => {
        const pre = wrapper.querySelector("pre");
        if (pre && wrapper.parentElement) {
          wrapper.parentElement.insertBefore(pre, wrapper);
        }
        wrapper.remove();
      });
      pres.forEach((pre) => {
        pre.dataset.copyAttached = "false";
        pre.classList.remove("docs-copy-container");
      });
    };
  }, []);

  return null;
}

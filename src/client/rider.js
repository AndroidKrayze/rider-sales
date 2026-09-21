import {
  copyDemoLink,
  paymentWhatsappMessage,
  webSharePayload,
  whatsappMessage,
  whatsappUrls
} from "./share.js";

const search = document.querySelector("#business-search");
const cards = [...document.querySelectorAll(".card")];
const count = document.querySelector("#search-count");
const empty = document.querySelector("#search-empty");
const form = document.querySelector('form[role="search"]');

function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function applySearch() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const haystack = `${card.dataset.name} ${card.dataset.area}`.toLowerCase();
    const show = query === "" || haystack.includes(query);
    card.hidden = !show;
    if (show) visible += 1;
  }
  count.textContent = query === "" ? `${cards.length} businesses` : `${visible} of ${cards.length} businesses`;
  empty.hidden = visible !== 0;
}

form.addEventListener("submit", (event) => event.preventDefault());
search.addEventListener("input", applySearch);

for (const link of document.querySelectorAll("[data-whatsapp]")) {
  const message = link.hasAttribute("data-payment")
    ? paymentWhatsappMessage(link.dataset.name, link.dataset.plan, link.dataset.url, link.dataset.summary)
    : whatsappMessage(link.dataset.name, link.dataset.demo);
  const urls = whatsappUrls(message);
  link.href = isMobile() ? urls.mobile : urls.web;
}

for (const button of document.querySelectorAll("[data-share]")) {
  if (!navigator.share) continue;
  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.share(webSharePayload(button.dataset.name, button.dataset.demo));
    } catch (error) {
      if (error?.name !== "AbortError") button.insertAdjacentText("afterend", " Share failed.");
    }
  });
}

for (const button of document.querySelectorAll("[data-copy]")) {
  const scope = button.closest(".plan") || button.closest(".actions");
  const status = scope.querySelector(".copy-status");
  const fallback = scope.querySelector(".copy-fallback");
  const input = fallback.querySelector("input");
  button.addEventListener("click", async () => {
    const result = await copyDemoLink(button.dataset.url, navigator.clipboard, document, {
      success: button.dataset.copied,
      fallback: button.dataset.fallback
    });
    status.textContent = result.message;
    if (result.fallback) {
      fallback.hidden = false;
      input.value = result.text;
      input.focus();
      input.select();
    } else {
      fallback.hidden = true;
    }
  });
}

for (const button of document.querySelectorAll("[data-purchase]")) {
  const dialog = button.closest(".card").querySelector("dialog");
  const close = dialog.querySelector("[data-close]");
  button.addEventListener("click", () => dialog.showModal());
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

for (const image of document.querySelectorAll("img.preview")) {
  image.addEventListener("error", () => {
    const fallback = document.createElement("div");
    fallback.className = "preview preview-fallback";
    fallback.textContent = image.alt.replace(/^Website preview of /, "");
    image.replaceWith(fallback);
  });
}

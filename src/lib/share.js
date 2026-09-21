export const COPY_MESSAGE = "Demo link copied";
export const COPY_FALLBACK_MESSAGE = "Copy this demo link";

export function whatsappMessage(businessName, demoUrl) {
  return `Hello, we created a website demonstration for ${businessName}.

You can view it here:
${demoUrl}

If you like it, we can publish and manage it for your business.`;
}

export function whatsappUrls(message) {
  const text = encodeURIComponent(message).replaceAll("'", "%27");
  return {
    mobile: `https://wa.me/?text=${text}`,
    web: `https://web.whatsapp.com/send?text=${text}`
  };
}

export function webSharePayload(businessName, demoUrl) {
  return {
    title: businessName,
    text: whatsappMessage(businessName, demoUrl),
    url: demoUrl
  };
}

export async function copyDemoLink(text, clipboard, documentRef) {
  if (clipboard && typeof clipboard.writeText === "function") {
    try {
      await clipboard.writeText(text);
      return { ok: true, fallback: false, message: COPY_MESSAGE, text };
    } catch {
      // The browser blocked the Clipboard API. Try the manual fallback.
    }
  }

  const copied = documentRef ? fallbackCopy(text, documentRef) : false;
  return {
    ok: copied,
    fallback: true,
    message: copied ? COPY_MESSAGE : COPY_FALLBACK_MESSAGE,
    text
  };
}

function fallbackCopy(text, documentRef) {
  const input = documentRef.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  documentRef.body.appendChild(input);
  input.select();
  let copied = false;
  try {
    copied = documentRef.execCommand("copy");
  } catch {
    copied = false;
  }
  input.remove();
  return copied;
}

import { getLlmClient } from "./LlmClient";
import SYSTEM_PROMPT from "./prompt.txt?raw";

async function pageIndex() {

  const apiKey = localStorage.getItem("api-key");
  if (apiKey) {
    console.log("API key found");
  }
  else {
    console.log("No API key found.");
  }
  const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
  const checkButton = document.getElementById("check")!;

  // Wait for the user to submit the API key
  checkButton.addEventListener("click", async () => {
    const newApiKey = apiKeyInput.value;
    // TODO: validate
    localStorage.setItem("api-key", newApiKey);
    console.log("API key saved:", newApiKey);
  });
}

async function page404() {
  // Hide the index page
  const indexPage = document.getElementById("index-page")!;
  indexPage.style.display = "none";

  const apiKey = localStorage.getItem("api-key");

  const client = getLlmClient(apiKey!);

  console.log("Generating content for 404 page...");
  const url = `${window.location.pathname}`;
  console.log(SYSTEM_PROMPT, url);

  const content = document.getElementById("404-page")!;

  const stream = client.streamText(SYSTEM_PROMPT, url);

  let innerHtml = "";
  let hasHtmlTagStarted = false;

  for await (const chunk of stream) {
    console.log("Chunk:", chunk);

    if (!hasHtmlTagStarted) {
      // find first html tag "<"
      const tagIndex = chunk.indexOf("<");
      if (tagIndex < 0) {
        continue;
      }
      // remove everything before the first HTML tag
      innerHtml += chunk.substring(tagIndex);
      hasHtmlTagStarted = true;
    }
    else {
      // remove ```html or ``` from the chunk
      innerHtml += chunk.replace("```", "");
    }
    content.innerHTML = innerHtml;

  }
}

const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
if (isIndexPage) {
  pageIndex();
}
else {
  page404();
}

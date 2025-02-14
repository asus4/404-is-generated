import { getLlmClient } from "./LlmClient";
import SYSTEM_PROMPT from "./prompt.txt?raw";

async function pageIndex() {

  const key = localStorage.getItem("api-key");
  if (key) {
    console.log("API key found:", key);
  }
  else {
    console.log("No API key found.");
  }
  const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
  const checkButton = document.getElementById("check")!;

  // Wait for the user to submit the API key
  checkButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value;
    localStorage.setItem("api-key", apiKey);
    console.log("API key saved:", apiKey);
  });
}

async function page404() {
  // Hide the index page
  const indexPage = document.getElementById("index-page")!;
  indexPage.style.display = "none";

  const apiKey = localStorage.getItem("api-key");

  const client = getLlmClient(apiKey!);

  console.log("Generating content for 404 page...");
  const url = `https://example.com${window.location.pathname}`;
  console.log(SYSTEM_PROMPT, url);
  const text = await client.generate(SYSTEM_PROMPT, url);

  const content = document.getElementById("404-page")!;

  if (!text) {
    console.error("Invalid response structure:", text);
    content.innerHTML = "Failed to generate content.";
  } else {
    // remove ```html and ``` from the generated text
    content.innerHTML = text.replace(/```html/g, "").replace(/```/g, "").trim();
  }
}

const isIndexPage = window.location.pathname === "/" || window.location.pathname === "/index.html";
if (isIndexPage) {
  pageIndex();
}
else {
  page404();
}

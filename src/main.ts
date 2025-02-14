import { getLlmClient } from "./LlmClient";

const SYSTEM_PROMPT = `You are an experienced web designer and front-end engineer. Based on the URL provided, imagine the content, theme the web page, and generate actual, usable HTML code.

[Conditions]

1. The URL does not represent the actual page content; instead, create the HTML code based on an "imagined" content derived from the URL’s string or structure.
2. The generated HTML should conform to the latest web standards. It must include a responsive design, appropriate meta tags, a title, header, navigation, main content area, footer, etc.
3. The page’s theme and atmosphere should be based on keywords or the structure present in the URL, making it intuitively understandable for the user.
4. Include CSS as needed (either inline or as an internal stylesheet) to ensure the code is visually appealing.
5. Only export the HTML code, Don't show your text.

[Input]
URL: 
`;

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
  const response = await client.generate(SYSTEM_PROMPT, url);

  const content = document.getElementById("404-page")!;

  if (!response) {
    console.error("Invalid response structure:", response);
    content.innerHTML = "Failed to generate content.";
  } else {
    const text = response!;
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

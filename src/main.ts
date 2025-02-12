import { GoogleGenerativeAI } from "@google/generative-ai";

async function initialSettingAsync() {
  const initialSettings = document.getElementById("initial-settings-view")!;
  const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
  const submitButton = document.getElementById("submit-api-key")!;

  // Wait for the user to submit the API key
  submitButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value;
    localStorage.setItem("api-key", apiKey);
    initialSettings.style.display = "none";
  });
}

async function main() {
  // Check for an already saved API key
  const initialSettings = document.getElementById("initial-settings-view")!;
  if (localStorage.getItem("api-key")) {
    initialSettings.style.display = "none";
  } else {
    initialSettings.style.display = "block";
    await initialSettingAsync();
  }

  const apiKey = localStorage.getItem("api-key");
  const genAI = new GoogleGenerativeAI(apiKey!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  console.log(model);

  // get url without domain



  const prompt = `You are an experienced web designer and front-end engineer. Based on the URL provided below, imagine the content, theme the web page, and generate actual, usable HTML code.

[Conditions]

1. The URL does not represent the actual page content; instead, create the HTML code based on an "imagined" content derived from the URL’s string or structure.
2. The generated HTML should conform to the latest web standards. It must include a responsive design, appropriate meta tags, a title, header, navigation, main content area, footer, etc.
3. The page’s theme and atmosphere should be based on keywords or the structure present in the URL, making it intuitively understandable for the user.
4. Include CSS as needed (either inline or as an internal stylesheet) to ensure the code is visually appealing.
5. Only export the HTML code, Don't show your text.

[Input]
URL: 
` + `https://example.com${window.location.pathname}`;

  console.log(prompt);
  const result = await model.generateContent([prompt]);
  const content = document.getElementById("content")!;

  if (!result.response || typeof result.response.text !== 'function') {
    console.error("Invalid response structure:", result);
    content.innerHTML = "Failed to generate content.";
  } else {
    const text = result.response.text();
    // remove ```html and ``` from the generated text
    content.innerHTML = text.replace(/```html/g, "").replace(/```/g, "");
  }
}

await main();

const fs = require("fs");
const path = require("path");

async function checkModels() {
  // 1. Get API Key from .env.local
  const envPath = path.join(__dirname, ".env.local");
  let apiKey = "";
  try {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
    }
  } catch (e) {
    console.error("❌ Could not read .env.local");
    return;
  }

  if (!apiKey || apiKey.includes("your_gemini_api_key")) {
    console.error("❌ API Key is missing or placeholder in .env.local");
    return;
  }

  console.log(`🔑 Checking models for key: ${apiKey.substring(0, 8)}...`);

  // 2. Fetch available models directly from REST API
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API Error:", data.error.message);
        return;
    }

    if (data.models) {
      console.log("\n✅ AVAILABLE MODELS (generateContent):");
      const validModels = data.models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace("models/", "")); // Strip 'models/' prefix for cleaner reading
      
      validModels.forEach(name => console.log(`- ${name}`));

      console.log("\n👇 RECOMMENDED FIX:");
      if (validModels.includes("gemini-1.5-flash")) {
          console.log("Use: 'gemini-1.5-flash'");
      } else if (validModels.includes("gemini-1.5-flash-001")) {
          console.log("Use: 'gemini-1.5-flash-001'");
      } else {
          console.log(`Use one of the above, preferably: ${validModels.find(m => m.includes("flash")) || validModels[0]}`);
      }
    } else {
      console.log("⚠️ No models found. Response:", data);
    }

  } catch (error) {
    console.error("❌ Network/Fetch Error:", error.message);
  }
}

checkModels();

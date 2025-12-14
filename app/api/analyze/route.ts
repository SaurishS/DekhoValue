import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // 1. Save file to temp directory
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.mp4`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(tempFilePath, fileBuffer);

    // 2. Upload to Gemini
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type || "video/mp4",
      displayName: "Insurance Video",
    });

    // 3. Wait for processing
    let fileState = await fileManager.getFile(uploadResult.file.name);
    while (fileState.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fileState = await fileManager.getFile(uploadResult.file.name);
    }

    if (fileState.state === "FAILED") {
      return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
    }

    // 4. Generate Content
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
            temperature: 0,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
        }
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      {
        text: `You are an expert Insurance Underwriter for the Indian market. Analyze this video. Identify visible high-value assets (Electronics, Furniture, Art, etc.).
        For each item:
        1. Identify Name (Specific model if possible).
        2. Assess Condition ('New', 'Used', 'Damaged').
        3. Estimate Price in INR (Indian Rupees).
        4. Assign Risk Level ('Low', 'Medium', 'High').

        Return ONLY valid JSON with this structure:
        {
          "items": [
            { "name": "...", "category": "...", "condition": "...", "estimated_price_inr": 0, "risk_factor": "..." }
          ],
          "total_value": 0,
          "recommended_coverage": 0
        }
        Do not include markdown formatting or code blocks. Just the raw JSON string.`
      }
    ]);

    const responseText = result.response.text();
    
    // Cleanup
    await fs.promises.unlink(tempFilePath);

    try {
        const jsonResponse = JSON.parse(responseText.replace(/```json|```/g, "").trim());
        return NextResponse.json(jsonResponse);
    } catch (e) {
        console.error("JSON Parse Error:", responseText);
        return NextResponse.json({ error: "Failed to parse AI response", raw: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error processing video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
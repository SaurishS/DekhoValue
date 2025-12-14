# 📸 DekhoValue - Visual Underwriting Agent

> **"Just Dekho and Value"**  
> *Transforming Home Insurance from a 20-minute form into a 10-second video.*

![DekhoValue Banner](https://via.placeholder.com/1200x600/2563eb/ffffff?text=DekhoValue+AI+Underwriter)

## 🏆 Project Overview
**DekhoValue** is a GenAI-powered web application built for the **AI Impact Summit India 2026 / GDG Hackathon**. It solves the biggest friction point in the Indian Home Insurance market: **Data Entry**.

Instead of filling out tedious forms listing every sofa, TV, and table, users simply **record a video** of their room. Our AI agent analyzes the footage, identifies assets, estimates their market value in INR, and generates an instant insurance quote.

## ✨ Key Features
*   **🎥 Video-to-Quote:** Upload a 10s clip; get a quote in seconds.
*   **🧠 Multimodal Intelligence:** Powered by **Google Gemini 2.5 Flash Lite**, it sees, understands, and values items like a human surveyor.
*   **🇮🇳 Hyper-Localized:** Estimates prices in **Indian Rupees (₹)** using Lakhs/Crores formatting.
*   **📄 Instant Documentation:** Generates a downloadable PDF Receipt for the user.
*   **🚀 One-Click Buy:** Redirects users to purchase pages of top insurers (Acko, Digit, ICICI).
*   **⚡ Zero Latency:** Optimized for Vercel Serverless functions with a <15s processing time.

## 🛠️ Tech Stack
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Lucide Icons
*   **AI Model:** Google Gemini 2.5 Flash Lite (`@google/generative-ai`)
*   **PDF Generation:** `jspdf` & `jspdf-autotable`
*   **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   A Google Gemini API Key

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/dekho-value.git
    cd dekho-value
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 💡 How It Works
1.  **Input:** User records/uploads a video (max 4.5MB for demo).
2.  **Processing:** The video is sent to Gemini 2.5 Flash Lite.
3.  **Analysis:** The LLM identifies objects, assesses condition ("New", "Used"), and estimates price based on its internal knowledge base.
4.  **Output:** A structured JSON response is returned and rendered as a beautiful UI with a calculated premium.

## 🔮 Future Roadmap
*   **Fraud Detection:** Geo-spatial fingerprinting to ensure videos are recorded at the insured address.
*   **Receipt Reconstruction:** AI agent that scans your email/SMS to find proof of purchase for identified items.
*   **AR Overlay:** Real-time price tags on items while scanning.

## 👥 Team
*   **[Your Name]** - Lead Developer & Architect

---
*Built with ❤️ for GDG GenAI Hackathon 2025*
# PathFinders Pro 🚀 | AI Autonomous Travel Planning Agent

An intelligent, mobile-first, offline-capable travel dashboard powered by a production-ready **Agentic ReAct Workflow Loop**. The application proactively intercepts changes in regional environments (such as weather anomalies) and audits expenditure inputs to dynamically restructure itineraries on behalf of the traveler.

Repository URL: https://github.com

---

## 🛠️ The Tech Stack (Core Pillars)

### 🌐 Frontend (The Visual Interface)
* **React & TypeScript:** Architected into modular, strongly typed presentation sub-modules (Itinerary, Budget, Climate Views).
* **Tailwind CSS:** Powers the responsive, low-latency dark-themed dashboard configuration.
* **Lucide Icons:** Provides visual anchors for navigation events.

### ⚙️ Backend (The Infrastructure Layer)
* **Node.js + Express Server:** Handles API routing structures and coordinates server-side logic tasks.
* **REST API Endpoints:** Exposes `/api/itinerary/generate` and `/api/agent/command` handlers to process structural JSON streams.
* **Dotenv Configuration:** Isolates environment credentials and keeps sensitive operational tokens protected out of source control.

### 🤖 AI Agent Core + Data Integration
* **Google Gemini API Engine:** Serves as the core LLM processing framework. Configured using strict system parameters to operate autonomously via tool-calling arrays.
* **Open-Meteo API Network:** Streams live coordinate geocoding and structural climate timeline data into the agent's prompt loop.
* **Local Storage Caching:** Ensures crucial itinerary files remain readable client-side without an active network connection.

---

## 🔄 How the AI Agent Architecture Works (ReAct Loop)

Unlike traditional static chatbots that simply display text, **PathFinders Pro** utilizes an active **Reasoning-Action-Observation loop** to coordinate tasks:

1. **Reason (LLM Engine):** The user submits an instruction (e.g., *"Check if it is raining on my trip to London"*). Gemini analyzes the text input against current plan parameters.
2. **Action (Tool Invocation):** The agent decides it lacks active metrics and autonomously triggers internal functional tools (`checkWeatherTool` or `optimizeBudgetTool`).
3. **Observation (Data Processing):** The backend executes the script tool (e.g., query to Open-Meteo), checks if `isOutdoorFriendly` evaluates to `FALSE`, and passes the live results array back to the model.
4. **Synthesis:** Gemini ingests the tool output, automatically modifies the schedule (e.g., swapping outdoor parks for historical covered galleries), and logs its reasoning directly onto the developer trace timeline.

---

## 🚀 Local Installation & Setup Steps

Follow these steps to boot the developer workspace sandbox environment locally:

### 1. Clone the repository files
```bash
git clone https://github.com.git
cd AI_Agent
```

### 2. Install required workspace dependencies
```bash
npm install
```

### 3. Establish your environment key bindings
Create a `.env` file in the root directory of the application:
```env
PORT=3000
GEMINI_API_KEY=your_actual_google_ai_studio_api_key_here
VITE_GEMINI_API_KEY=your_actual_google_ai_studio_api_key_here
```

### 4. Initialize the Hot-Reload Development Server
```bash
npm run dev
```
Open your browser window layout and target `http://localhost:3000` to inspect the responsive sandbox panel.

---

## 📊 Data Integrity & Prototyping Disclosures
In strict accordance with transparency requirements, all calculated budget values, deficit alerts, and crowd metrics are clearly labeled within the UI sub-cards as **Prototyped Calculations** and **Algorithmic Baseline Matrices**. This layout method preserves presentation data integrity by ensuring estimated metrics are never falsely represented to the traveler as production real-time third-party updates.


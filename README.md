# 🚀 Astro Repo

> **Navigate large codebases like galaxies.  
An AI-powered, visual GitHub repo explorer built for clarity, context, and curiosity.**

---

## 🔍 Overview

**Astro Repo** is a 3D, AI-augmented GitHub repository explorer that helps developers **understand unfamiliar codebases** visually and interactively.

Whether you're onboarding into a new project or auditing an open-source repo, Astro Repo lets you:

- 🧠 **Summarize any file** using LLMs (Gemini/Groq)
- 🔭 **Explore repo structure in 3D** via a force-directed graph (powered by Three.js)
- 📁 **Click and navigate files** like planets orbiting logic
- 💬 **(Upcoming)**: Ask-the-Repo Chatbot, PR summaries, redundancy detection & more

Built entirely as a **personal learning project**, Astro Repo combines modern frontend tech with cutting-edge AI capabilities to reimagine how we interface with code.

---

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, TailwindCSS
- **Visualization**: `react-force-graph-3d`, Three.js
- **Backend API**: Next.js API routes (Edge/Serverless)
- **GitHub Integration**: Octokit, GitHub REST API
- **AI Models**: Gemini (Google), Groq (Mixtral)
- **Deployment**: Vercel
- **Auth & Security**: GitHub Token (local/dev only)

---

## 🚗 How It Works

1. 🔗 Enter a GitHub repo link
2. 📦 Octokit fetches the repo's file structure
3. 🌌 The repo is rendered in a 3D graph
4. 🖱 Click any file node → AI fetches and summarizes the content using Gemini or Groq
5. 📖 Summary is shown alongside raw code for better understanding

---

## 🚀 Live Demo

👉 [Explore it yourself](https://astro-repo.vercel.app/home)

Dive into a GitHub repo like it's a galaxy 🌌  
Visualize code. Summarize files. Discover logic effortlessly.

---

### 🖼️ Screenshots

> A glimpse into the Astro Repo interface:

<img src="https://github.com/user-attachments/assets/c3083c50-2dda-408e-9ecf-247788363af4" width="100%" alt="Screenshot 1" />
<br/>
<img src="https://github.com/user-attachments/assets/15b83481-7d8c-4f22-a706-e0f736a1ab2a" width="100%" alt="Screenshot 2" />
<br/>
<img src="https://github.com/user-attachments/assets/db7cb1fd-dc2a-4909-a738-15c688b623f1" width="100%" alt="Screenshot 3" />






---

## 🧪 Features (Now & Upcoming)

| Feature                  | Status         |
|--------------------------|----------------|
| 3D GitHub repo graph     | ✅ Completed   |
| File summarization (AI)  | ✅ Completed   |
| Ask-the-repo Chatbot     | 🚧 In Progress |
| Redundant file detection | 🧠 Planning    |
| PR summarization         | 🧠 Planning    |
| Keyboard navigation      | 🔜 Planned     |

---

## 🤝 Contributing

Astro Repo is a **work-in-progress open-source project** — contributions, feature ideas, and code reviews are more than welcome!

### To get started:
```bash
git clone https://github.com/swapisticated/ExplainMyShit
cd explainmyshit
npm install
npm run dev
```
## 📄 License

MIT License

## 💬 Feedback & Contact

Got ideas? Found a bug? Want to contribute?

Drop an issue, create a PR, or reach out on LinkedIn – let’s build better dev tools together!

# JinVaani (जिनवाणी) 🪔

> जिन भक्ति के मधुर स्वर — A peaceful Jain devotional radio and audio aggregator.

JinVaani is a modern web-based audio streaming application that provides a peaceful Jain spiritual experience. It features continuous global radio playback, curated devotional playlists, wisdom quotes, and community experiences, all packaged inside a premium dark-themed layout.

---

## ✨ Features

* **Continuous Radio & Background Audio:** Persistent global audio player powered by the YouTube IFrame API that maintains playback seamlessly across page transitions.
* **Curated Playlists:** Categorized playlists for Morning Stavans, Evening Stavans, and complete collections of Jain devotional songs.
* **Live Visitor Counter:** A real-time listener presence badge simulating current users online.
* **Daily Wisdom & Quotes:** Devotional maxims and teachings translated from Jain scriptures and philosophers.
* **Community Experience (Anubhav):** An interactive section to read reviews and feedback from other devotees.
* **Responsive Visuals:** Sleek design featuring custom styling, soft glassmorphic effects, and fluid background slideshows.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19 (using conditional JSX layouts, dynamic route bindings, and suspense fallback components)
* **Routing:** React Router DOM (v7)
* **Audio Integration:** YouTube IFrame API
* **Build System:** Vite
* **Testing Suite:** Vitest (jsdom) + React Testing Library

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/devenkapadia/JinVaani.git
   cd JinVaani
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🧪 Testing

We have built a custom test suite using Vitest to ensure code stability and correct functional behavior.

To run the unit and component tests:
```bash
npm run test
```

To run tests in watch mode:
```bash
npm run test:watch
```

---

## 📄 License & Content Policy

All audio content is streamed via the official YouTube IFrame Embed API in full compliance with YouTube's Terms of Service. JinVaani does not host, download, or redistribute raw audio files.

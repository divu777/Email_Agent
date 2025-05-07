# 📧 AI Email Agent

An AI-powered Gmail agent that reads and replies to emails intelligently using OpenAI, with privacy-first architecture, seamless authentication, and real-time email detection—without relying on Google Cloud Pub/Sub.

---

## 🚀 Features

- 🔒 **OAuth2-based Gmail Authentication**  
  Secure, user-consented login flow using Google's OAuth2 APIs.
- 🤖 **Smart Email Replies with OpenAI**  
  Context-aware, natural-sounding replies generated using GPT models.
- 📥 **Real-time Email Detection **  
  Efficient in-memory tracking system for detecting new emails without push notifications.
- 🧠 **Memory Management**  
  Keeps track of processed threads in-memory for low-latency response and scalability.
- 📊 **Real-Time Analytics**
  Enhanced analytics dashboard with response metrics
- 🎯 **Prompt Templates**
  Custom prompt templates for different email contexts

---

## 🔧 Tech Stack

- **Frontend:** React / Redux-Toolkit / Chart.js / Tailwind CSS / Framer Motion 
- **Backend:** Node.js / Express / TypeScript / BullMQ / Socket.io
- **AI Integration:** DeepSeek r1 (via Huggingface)
- **Auth:** Clerk 
- **Email API:** Gmail OAuth API (REST)
- **State Handling:** In-memory thread tracking (optionally extendable to Redis)
- **Deployment:** Docker-ready, can be deployed on Fly.io / Vercel / AWS

---

## 📸 Demo

> ![Preview](https://res.cloudinary.com/dwrqohfya/image/upload/v1745247710/Screenshot_2025-04-21_at_2.06.47_AM_w3p5pc_cegovk.jpg)

---

## 🧱 Architecture Overview

User → OAuth Consent → Gmail API
↓
Fetch Emails
↓
Check New Threads (in-memory)
↓
Generate Reply (OpenAI API)
↓
Send Reply via Gmail API

---

## 📌 Future Improvements

* 🔁 Background Pub-Sub polling (for production reliability)
* 🧵 Multi-user session support (with token refresh logic)
* 🧠 Summarize inbox threads and also Organise inbox
* 🌐 Chrome extension for inline reply previews


## 📄 License

MIT License © Divakar Jaiswal

## 🌟 Show Your Support

If you like this project, consider giving it a ⭐ on GitHub!
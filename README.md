# 🎬 YT Downloader PRO

Scarica video da YouTube fino alla risoluzione **4K HDR 60fps** con un'interfaccia web moderna e intuitiva.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Funzionalità

- 🎥 Download video YouTube fino a **4K HDR 60fps**
- 🎵 Unione automatica di audio e video tramite **ffmpeg**
- 🎨 Interfaccia web moderna con tema scuro e glassmorphism
- ⚡ Selezione qualità: 4K / 1440p / 1080p / 720p
- 📱 Design responsive per ogni dispositivo

## 📋 Prerequisiti

- [Node.js](https://nodejs.org/) (v18 o superiore)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installato e nel PATH

### Installare yt-dlp

**macOS (Homebrew):**
```bash
brew install yt-dlp
```

**Windows (winget):**
```bash
winget install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

## 🚀 Installazione

```bash
# Clona la repository
git clone https://github.com/Gabriele2314/yt-downloader.git
cd yt-downloader

# Installa le dipendenze
npm install

# Avvia il server
node server.js
```

Apri il browser su **http://localhost:3000** e inizia a scaricare!

## 🛠 Struttura del progetto

```
yt-downloader/
├── server.js          # Backend Node.js + Express
├── package.json       # Dipendenze
├── .gitignore
├── public/
│   ├── index.html     # Pagina HTML
│   ├── styles.css     # Stili CSS
│   └── script.js      # Logica frontend
└── README.md
```

## ⚙️ Come funziona

1. Incolli il link del video YouTube nell'interfaccia
2. Il backend chiama `yt-dlp` per ottenere le informazioni del video
3. Selezioni la qualità desiderata (fino a 4K)
4. Il backend scarica i flussi video e audio separati, li unisce con `ffmpeg` in un unico file MP4, e te lo invia

## 📄 Licenza

MIT

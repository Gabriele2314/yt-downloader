# 🎬 YT Downloader PRO

Scarica video da YouTube fino alla risoluzione **4K HDR 60fps** con un'interfaccia web moderna e intuitiva.

![Node.js](https://img.shields.io/badge/Static_Site-GitHub_Pages-blue?logo=github)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌐 Prova subito

**[Apri YT Downloader PRO](https://gabriele2314.github.io/yt-downloader/)**

## ✨ Funzionalità

- 🎥 Download video YouTube fino a **4K HDR 60fps**
- 🎵 Unione automatica audio + video
- 🎨 Interfaccia web moderna con tema scuro e glassmorphism
- ⚡ Selezione qualità: 4K / 1440p / 1080p / 720p
- 🔧 Scelta codec: H.264, VP9, AV1
- 📱 Design responsive per ogni dispositivo
- 🚀 **Architettura Ibrida**: Usa la comodità del sito pubblico su GitHub Pages, ma sfrutta la potenza del tuo computer (in locale) per scaricare e unire i video tramite `yt-dlp` e `ffmpeg`, aggirando blocchi e limitazioni API.

## ⚙️ Come funziona

1. **Avvia il server in locale:** Per funzionare, il sito ha bisogno del backend Node.js in esecuzione sul tuo Mac. Questo permette di gestire `yt-dlp` in locale per la massima qualità.
2. Incolli il link del video YouTube sull'interfaccia.
3. Selezioni la qualità desiderata (fino a 4K).
4. Il frontend web comunica con il tuo server locale `localhost:3000`, che scaricherà i flussi, li unirà con `ffmpeg` in un unico file MP4, e avvierà il download nel tuo browser.

## 🛠 Istruzioni d'uso

```bash
# Assicurati di aver clonato la repo e installato le dipendenze
git clone https://github.com/Gabriele2314/yt-downloader.git
cd yt-downloader
npm install

# 1. Avvia il server backend in locale (lascia questa finestra aperta)
node server.js
```

**2. Apri il sito pubblico:**
Vai su **[https://gabriele2314.github.io/yt-downloader/](https://gabriele2314.github.io/yt-downloader/)** e inizia a scaricare!

## 📁 Struttura del progetto

```
yt-downloader/
├── index.html     # Pagina principale
├── styles.css     # Stili CSS premium
├── script.js      # Logica frontend
└── README.md
```

## 📄 Licenza

MIT

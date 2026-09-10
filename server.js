const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

const YT_DLP_PATH = '/opt/homebrew/bin/yt-dlp';

// Helper to run yt-dlp
function runYtDlp(args) {
    return new Promise((resolve, reject) => {
        execFile(YT_DLP_PATH, args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error("yt-dlp error:", stderr || error);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Endpoint to get video info
app.get('/api/info', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL mancante' });

    try {
        const stdout = await runYtDlp([
            '--dump-json',
            '--no-warnings',
            '--no-call-home',
            '--no-check-certificate',
            url
        ]);
        const info = JSON.parse(stdout);
        res.json(info);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle informazioni del video' });
    }
});

// Endpoint to download video
app.get('/api/download', async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send('URL mancante');

    let formatQuery = 'bestvideo+bestaudio/best';
    
    // Select format based on requested quality
    if (quality === '4k') {
        formatQuery = 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best';
    } else if (quality === '1440p') {
        formatQuery = 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best';
    } else if (quality === '1080p') {
        formatQuery = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
    } else if (quality === '720p') {
        formatQuery = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best';
    }

    const tmpFileName = `video_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`;
    const tmpDir = path.join(__dirname, 'tmp');
    const tmpFilePath = path.join(tmpDir, tmpFileName);

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    try {
        console.log(`Inizio download per: ${url} (Qualità: ${quality || 'best'})`);
        
        // Esegue yt-dlp per scaricare e unire il video
        await runYtDlp([
            '-f', formatQuery,
            '--merge-output-format', 'mp4',
            '--ffmpeg-location', ffmpegStatic,
            '-o', tmpFilePath,
            '--no-warnings',
            url
        ]);

        console.log(`Download completato. Invio file: ${tmpFilePath}`);
        
        let title = 'video.mp4';
        try {
            const stdout = await runYtDlp(['--dump-json', url]);
            const info = JSON.parse(stdout);
            if (info.title) {
                // Sanitize title for filename
                title = info.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '.mp4';
            }
        } catch(e) {
            // ignore
        }

        res.download(tmpFilePath, title, (err) => {
            if (err) console.error("Errore invio file:", err);
            // Cleanup post download
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
        });
    } catch (error) {
        console.error("Errore di download yt-dlp:", error);
        if (fs.existsSync(tmpFilePath)) {
            fs.unlinkSync(tmpFilePath);
        }
        res.status(500).send('Errore durante il download del video');
    }
});

app.listen(port, () => {
    console.log(`Server backend in esecuzione su http://localhost:${port}`);
});

document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const fetchBtn = document.getElementById('fetchBtn');
    const fetchBtnText = fetchBtn.querySelector('.btn-text');
    const fetchLoader = fetchBtn.querySelector('.loader');
    const errorMsg = document.getElementById('errorMsg');

    const resultSection = document.getElementById('resultSection');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');

    const qualityBtns = document.querySelectorAll('.quality-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnText = downloadBtn.querySelector('.btn-text');
    const downloadLoader = downloadBtn.querySelector('.loader');
    const downloadBtnIcon = downloadBtn.querySelector('svg');
    const downloadStatus = document.getElementById('downloadStatus');

    let currentVideoUrl = '';
    let selectedQuality = '1080';

    // BACKEND API CONFIG
    const BACKEND_API = 'http://localhost:3000/api';

    // Extract YouTube video ID from URL
    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    // Get video info using YouTube's oEmbed API (CORS-friendly)
    async function getVideoInfo(url) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oembedUrl);
        if (!response.ok) throw new Error('Video non trovato o non disponibile.');
        return response.json();
    }

    // Handle fetching video info
    fetchBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            showError('Per favore, inserisci un link di YouTube valido.');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            showError('Il link non sembra essere un link di YouTube valido.');
            return;
        }

        hideError();
        resultSection.classList.add('hidden');
        downloadStatus.classList.add('hidden');
        setLoading(fetchBtn, fetchBtnText, fetchLoader, true);

        try {
            const info = await getVideoInfo(url);

            currentVideoUrl = url;
            videoTitle.textContent = info.title || 'Video Sconosciuto';
            videoAuthor.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${info.author_name || 'Sconosciuto'}
            `;

            // Use maxresdefault thumbnail
            thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            thumbnail.onerror = () => {
                thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            };

            resultSection.classList.remove('hidden');
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err) {
            showError(err.message || 'Errore durante l\'analisi del video.');
        } finally {
            setLoading(fetchBtn, fetchBtnText, fetchLoader, false);
        }
    });

    // Allow Enter key to trigger fetch
    videoUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchBtn.click();
    });

    // Handle quality selection
    qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            qualityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedQuality = btn.dataset.quality;
        });
    });

    // Handle download via Local Backend API
    downloadBtn.addEventListener('click', async () => {
        if (!currentVideoUrl) return;

        // Map quality
        let backendQuality = '1080p';
        if (selectedQuality === '2160') backendQuality = '4k';
        if (selectedQuality === '1440') backendQuality = '1440p';
        if (selectedQuality === '1080') backendQuality = '1080p';
        if (selectedQuality === '720') backendQuality = '720p';

        setLoading(downloadBtn, downloadBtnText, downloadLoader, true, downloadBtnIcon);
        showStatus('⏳ Il tuo server locale sta scaricando e unendo il video (ffmpeg). Potrebbe richiedere qualche minuto per i video in 4K...', 'info');

        try {
            // Check if server is running
            try {
                await fetch('http://localhost:3000/api/info?url=https://youtube.com', { method: 'HEAD', mode: 'no-cors' });
            } catch (e) {
                throw new Error("Il server locale non è in esecuzione. Avvia 'node server.js' nel terminale.");
            }

            const downloadUrl = `${BACKEND_API}/download?url=${encodeURIComponent(currentVideoUrl)}&quality=${backendQuality}`;
            
            // Create a hidden link to trigger the download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // Assume the download prompt appeared after a short timeout
            setTimeout(() => {
                document.body.removeChild(a);
                showStatus('✅ Download avviato! Controlla i tuoi download.', 'success');
                setLoading(downloadBtn, downloadBtnText, downloadLoader, false, downloadBtnIcon);
            }, 3000);

        } catch (err) {
            console.error('Download error:', err);
            showStatus(`❌ Errore: ${err.message}`, 'error');
            setLoading(downloadBtn, downloadBtnText, downloadLoader, false, downloadBtnIcon);
        }
    });

    // === UTILITY FUNCTIONS ===

    function setLoading(btn, textEl, loaderEl, isLoading, iconEl) {
        btn.disabled = isLoading;
        textEl.classList.toggle('hidden', isLoading);
        loaderEl.classList.toggle('hidden', !isLoading);
        if (iconEl) iconEl.classList.toggle('hidden', isLoading);
    }

    function showError(msg) {
        errorMsg.innerHTML = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.classList.add('hidden');
    }

    function showStatus(msg, type) {
        downloadStatus.innerHTML = msg;
        downloadStatus.className = `status-msg ${type}`;
        downloadStatus.classList.remove('hidden');
    }
});

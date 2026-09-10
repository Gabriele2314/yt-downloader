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

    // COBALT API CONFIG
    const COBALT_API = 'https://api.cobalt.tools';

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

    // Handle download via Cobalt API
    downloadBtn.addEventListener('click', async () => {
        if (!currentVideoUrl) return;

        const selectedCodec = document.querySelector('input[name="codec"]:checked').value;

        setLoading(downloadBtn, downloadBtnText, downloadLoader, true, downloadBtnIcon);
        showStatus('⏳ Elaborazione in corso tramite Cobalt... Potrebbe richiedere qualche secondo.', 'info');

        try {
            const response = await fetch(COBALT_API, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: currentVideoUrl,
                    videoQuality: selectedQuality,
                    youtubeVideoCodec: selectedCodec,
                    filenameStyle: 'pretty',
                    downloadMode: 'auto',
                }),
            });

            const data = await response.json();

            if (data.status === 'redirect' || data.status === 'tunnel') {
                showStatus('✅ Download pronto! Il file si sta scaricando...', 'success');
                // Open the download URL
                window.open(data.url, '_blank');
            } else if (data.status === 'picker') {
                // Multiple streams available, use the first video one
                if (data.picker && data.picker.length > 0) {
                    showStatus('✅ Download pronto!', 'success');
                    window.open(data.picker[0].url, '_blank');
                } else {
                    throw new Error('Nessun formato disponibile.');
                }
            } else if (data.status === 'error') {
                throw new Error(data.error?.code || 'Errore dal server Cobalt.');
            } else {
                throw new Error('Risposta inattesa dal server.');
            }

        } catch (err) {
            console.error('Download error:', err);

            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                showStatus(
                    '⚠️ Il server Cobalt non è raggiungibile dal browser (CORS). ' +
                    'Puoi usare <a href="https://cobalt.tools" target="_blank" style="color: inherit; text-decoration: underline;">cobalt.tools</a> direttamente, ' +
                    'oppure esegui il sito in locale con Node.js per un\'esperienza completa.',
                    'error'
                );
            } else {
                showStatus(`❌ Errore: ${err.message}`, 'error');
            }
        } finally {
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

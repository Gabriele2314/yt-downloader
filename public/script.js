document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const fetchBtn = document.getElementById('fetchBtn');
    const fetchBtnText = fetchBtn.querySelector('.btn-text');
    const fetchLoader = fetchBtn.querySelector('.loader');
    const errorMsg = document.getElementById('errorMsg');
    
    const resultSection = document.getElementById('resultSection');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoDuration = document.getElementById('videoDuration');
    
    const qualityBtns = document.querySelectorAll('.quality-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnText = downloadBtn.querySelector('.btn-text');
    const downloadLoader = downloadBtn.querySelector('.loader');
    const downloadBtnIcon = downloadBtn.querySelector('svg');
    const downloadStatus = document.getElementById('downloadStatus');

    let currentVideoUrl = '';
    let selectedQuality = '1080p';

    // Format duration from seconds to MM:SS
    function formatDuration(seconds) {
        if (!seconds) return '--:--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Handle fetching video info
    fetchBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            showError('Per favore, inserisci un link di YouTube valido.');
            return;
        }

        // Basic validation
        if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
            showError('Il link non sembra essere un link di YouTube valido.');
            return;
        }

        // Reset UI
        errorMsg.classList.add('hidden');
        resultSection.classList.add('hidden');
        downloadStatus.classList.add('hidden');
        
        // Loading state
        fetchBtn.disabled = true;
        fetchBtnText.classList.add('hidden');
        fetchLoader.classList.remove('hidden');

        try {
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Impossibile recuperare le info del video.');
            }
            
            const data = await response.json();
            
            // Update UI
            currentVideoUrl = url;
            videoTitle.textContent = data.title || 'Video Sconosciuto';
            thumbnail.src = data.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
            videoDuration.textContent = `Durata: ${formatDuration(data.duration)}`;
            
            resultSection.classList.remove('hidden');
            
            // Scroll to results smoothly
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err) {
            showError(err.message || 'Si è verificato un errore durante l\'analisi del video.');
        } finally {
            fetchBtn.disabled = false;
            fetchBtnText.classList.remove('hidden');
            fetchLoader.classList.add('hidden');
        }
    });

    // Handle quality selection
    qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            qualityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedQuality = btn.dataset.quality;
        });
    });

    // Handle download
    downloadBtn.addEventListener('click', () => {
        if (!currentVideoUrl) return;

        // Visual feedback for long process
        downloadBtn.disabled = true;
        downloadBtnText.textContent = 'Elaborazione in corso...';
        downloadBtnIcon.classList.add('hidden');
        downloadLoader.classList.remove('hidden');
        downloadStatus.classList.remove('hidden');

        // Create a temporary hidden link to trigger the download
        const downloadUrl = `/api/download?url=${encodeURIComponent(currentVideoUrl)}&quality=${selectedQuality}`;
        
        // We use an iframe or a hidden a-tag to trigger the browser download without leaving the page
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.style.display = 'none';
        
        // Since we can't easily track when the download starts/finishes via simple navigation, 
        // we reset the UI after a timeout, assuming the download prompt appeared.
        // For a more robust solution, Server-Sent Events or WebSockets would be used.
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            resetDownloadBtn();
        }, 3000);
    });

    function resetDownloadBtn() {
        downloadBtn.disabled = false;
        downloadBtnText.textContent = 'Scarica Video';
        downloadBtnIcon.classList.remove('hidden');
        downloadLoader.classList.add('hidden');
        downloadStatus.classList.add('hidden');
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }
});

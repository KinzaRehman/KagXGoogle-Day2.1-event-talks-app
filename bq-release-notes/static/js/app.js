document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshIcon = document.getElementById('refresh-icon');
    const btnText = document.getElementById('btn-text');
    const releasesContainer = document.getElementById('releases-container');
    
    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statFeatures = document.getElementById('stat-features');
    const statIssues = document.getElementById('stat-issues');
    
    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const tweetTextarea = document.getElementById('tweet-text');
    const charCountDisplay = document.getElementById('char-count');
    const btnPostTweet = document.getElementById('btn-post-tweet');
    
    let isFetching = false;
    
    // Fetch and render release notes
    async function fetchReleases() {
        if (isFetching) return;
        
        // Enter loading state
        isFetching = true;
        btnRefresh.disabled = true;
        refreshIcon.classList.add('spinner');
        btnText.textContent = 'Refreshing...';
        
        try {
            const response = await fetch('/api/releases');
            const data = await response.json();
            
            if (data.success) {
                renderReleases(data.releases);
                updateStats(data.releases);
            } else {
                renderError(data.error || 'Failed to load release notes.');
            }
        } catch (error) {
            renderError('Connection error. Please check if the backend is running.');
            console.error('Error fetching release notes:', error);
        } finally {
            // Exit loading state
            isFetching = false;
            btnRefresh.disabled = false;
            refreshIcon.classList.remove('spinner');
            btnText.textContent = 'Refresh';
        }
    }
    
    // Render the release notes grouped by date
    function renderReleases(releases) {
        if (!releases || releases.length === 0) {
            releasesContainer.innerHTML = `
                <div class="loading-state">
                    <p>No release notes found.</p>
                </div>`;
            return;
        }
        
        // Group releases by date
        const grouped = {};
        releases.forEach(rel => {
            if (!grouped[rel.date]) {
                grouped[rel.date] = [];
            }
            grouped[rel.date].push(rel);
        });
        
        releasesContainer.innerHTML = '';
        
        // Render each date group
        Object.entries(grouped).forEach(([date, items]) => {
            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group fade-in';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = date;
            dayGroup.appendChild(dayHeader);
            
            items.forEach(item => {
                const card = createReleaseCard(item);
                dayGroup.appendChild(card);
            });
            
            releasesContainer.appendChild(dayGroup);
        });
    }
    
    // Create a release card element
    function createReleaseCard(item) {
        const card = document.createElement('div');
        
        // Class mapping for indicator borders
        const typeLower = item.type.toLowerCase();
        let borderClass = 'default';
        if (typeLower.includes('feature')) borderClass = 'feature';
        else if (typeLower.includes('issue') || typeLower.includes('deprecation')) borderClass = 'issue';
        
        card.className = `release-card ${borderClass}`;
        
        // Meta header
        const meta = document.createElement('div');
        meta.className = 'card-meta';
        
        const badge = document.createElement('span');
        badge.className = `badge ${borderClass}`;
        badge.textContent = item.type;
        
        const date = document.createElement('span');
        date.className = 'card-date';
        date.textContent = item.date;
        
        meta.appendChild(badge);
        meta.appendChild(date);
        card.appendChild(meta);
        
        // Body content
        const body = document.createElement('div');
        body.className = 'card-body';
        body.innerHTML = item.body;
        card.appendChild(body);
        
        // Card Footer / Action bar
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const tweetBtn = document.createElement('button');
        tweetBtn.className = 'btn-tweet';
        tweetBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Tweet
        `;
        
        tweetBtn.addEventListener('click', () => openTweetComposer(item));
        actions.appendChild(tweetBtn);
        card.appendChild(actions);
        
        return card;
    }
    
    // Update header metrics
    function updateStats(releases) {
        statTotal.textContent = releases.length;
        
        const features = releases.filter(r => r.type.toLowerCase().includes('feature')).length;
        const issues = releases.filter(r => r.type.toLowerCase().includes('issue') || r.type.toLowerCase().includes('deprecation')).length;
        
        statFeatures.textContent = features;
        statIssues.textContent = issues;
    }
    
    // Display error message
    function renderError(message) {
        releasesContainer.innerHTML = `
            <div class="error-state fade-in">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>An Error Occurred</h3>
                <p class="error-message">${message}</p>
            </div>`;
    }
    
    // Strip HTML Tags
    function stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }
    
    // Open Twitter Composer Modal
    function openTweetComposer(release) {
        let plainBody = stripHtml(release.body)
            .replace(/\s+/g, ' ')
            .trim();
        
        // Format of the tweet template
        // BigQuery [Feature]: "Description..." #BigQuery #GoogleCloud
        const suffix = " #BigQuery #GoogleCloud";
        const prefix = `BigQuery [${release.type}]: "`;
        
        // Determine remaining space
        const allowedLength = 280 - prefix.length - 2 - suffix.length; // 2 for close quote and space
        
        if (plainBody.length > allowedLength) {
            plainBody = plainBody.substring(0, allowedLength - 3) + '...';
        }
        
        const defaultTweet = `${prefix}${plainBody}"${suffix}`;
        
        tweetTextarea.value = defaultTweet;
        updateCharCount();
        
        // Show modal
        tweetModal.classList.add('active');
    }
    
    // Close Modal
    function closeModal() {
        tweetModal.classList.remove('active');
    }
    
    // Update character count
    function updateCharCount() {
        const len = tweetTextarea.value.length;
        const remaining = 280 - len;
        charCountDisplay.textContent = remaining;
        
        if (remaining < 0) {
            charCountDisplay.classList.add('error');
            btnPostTweet.disabled = true;
            btnPostTweet.style.opacity = 0.5;
            btnPostTweet.style.cursor = 'not-allowed';
        } else {
            charCountDisplay.classList.remove('error');
            btnPostTweet.disabled = false;
            btnPostTweet.style.opacity = 1;
            btnPostTweet.style.cursor = 'pointer';
        }
    }
    
    // Handle Tweet Posting redirection
    function postTweet() {
        const text = tweetTextarea.value;
        const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(tweetUrl, '_blank');
        closeModal();
    }
    
    // Event Listeners
    btnRefresh.addEventListener('click', fetchReleases);
    btnCloseModal.addEventListener('click', closeModal);
    tweetTextarea.addEventListener('input', updateCharCount);
    btnPostTweet.addEventListener('click', postTweet);
    
    // Close modal on overlay click
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) closeModal();
    });
    
    // Fetch initial data on page load
    fetchReleases();
});

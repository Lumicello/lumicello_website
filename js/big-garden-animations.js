// Intersection Observer for animations
const animatedElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

animatedElements.forEach(el => observer.observe(el));

// Social sharing
function shareJourney(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Every child blooms in their own time. Big Garden helps you see it happen.');

    let shareUrl;
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            break;
        case 'instagram':
            // Instagram doesn't support direct URL sharing - use Web Share API on mobile
            if (navigator.share) {
                navigator.share({
                    title: 'Big Garden',
                    text: 'Every child blooms in their own time. Big Garden helps you see it happen.',
                    url: window.location.href
                });
            } else {
                // Fallback: copy link and prompt user
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copied! Open Instagram and paste in your story or post.');
                });
            }
            return;
        case 'line':
            shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
            break;
        case 'copy':
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
            });
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Quotable Cards Share Functionality
const quotableShareButtons = document.querySelectorAll('.quotable-card .share-btn');
const pageUrl = encodeURIComponent(window.location.href);

quotableShareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.quotable-card');
        const quote = card ? card.dataset.quote : '';
        const encodedQuote = encodeURIComponent(quote + ' – Big Garden');
        const platform = btn.dataset.platform;

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedQuote}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedQuote}&url=${pageUrl}`;
                break;
            case 'instagram':
                if (navigator.share) {
                    navigator.share({
                        title: 'Big Garden',
                        text: quote + ' – Big Garden',
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(quote + ' – Big Garden\n' + window.location.href).then(() => {
                        alert('Quote copied! Open Instagram and paste in your story or post.');
                    });
                }
                return;
            case 'line':
                shareUrl = `https://social-plugins.line.me/lineit/share?url=${pageUrl}&text=${encodedQuote}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(quote + ' – Big Garden\n' + window.location.href).then(() => {
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 2000);
                });
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    });
});

// Joyful Floating Particles for Garden Metaphor Section
function createParticles() {
    const container = document.getElementById('gardenParticles');
    if (!container) return;

    // Particle configurations - each type has its own personality
    const particleTypes = [
        // Pollen - golden sparkles rising from flowers (most common)
        {
            type: 'pollen',
            count: 8,
            durationRange: [6, 9],
            startYRange: [70, 95], // Start from lower portion (near flowers)
        },
        // Seeds - whimsical dandelion-like seeds
        {
            type: 'seed',
            count: 4,
            durationRange: [8, 12],
            startYRange: [65, 85],
        },
        // Petals - joyful twirling flower petals
        {
            type: 'petal',
            count: 5,
            durationRange: [7, 10],
            startYRange: [60, 80],
            colors: ['#FFCCD5', '#FFE4E1', '#FFF0F5', '#E8855E', '#D9A835'],
        },
        // Sparkles - magical glints of light (quick bursts)
        {
            type: 'sparkle',
            count: 6,
            durationRange: [2.5, 4],
            startYRange: [50, 90],
        },
        // Leaf motes - tiny leaf fragments
        {
            type: 'leaf-mote',
            count: 4,
            durationRange: [9, 13],
            startYRange: [55, 75],
        },
    ];

    // Create particles in orchestrated waves
    let baseDelay = 0;

    particleTypes.forEach(config => {
        for (let i = 0; i < config.count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${config.type}`;

            // Distribute particles across the width with some clustering
            const xPosition = 5 + (Math.random() * 90);
            particle.style.left = `${xPosition}%`;

            // Start position within configured range
            const yPosition = config.startYRange[0] +
                Math.random() * (config.startYRange[1] - config.startYRange[0]);
            particle.style.top = `${yPosition}%`;

            // Varied duration within range
            const duration = config.durationRange[0] +
                Math.random() * (config.durationRange[1] - config.durationRange[0]);
            particle.style.setProperty('--duration', `${duration}s`);

            // Staggered delays for natural orchestration
            // Each particle type starts in a wave, then individual particles are offset
            const particleDelay = baseDelay + (i * 0.8) + (Math.random() * 2);
            particle.style.setProperty('--delay', `${particleDelay}s`);

            // Random colors for petals
            if (config.colors) {
                const color = config.colors[Math.floor(Math.random() * config.colors.length)];
                particle.style.setProperty('--petal-color', color);
            }

            container.appendChild(particle);
        }

        // Stagger the start of each particle type wave
        baseDelay += 1.5;
    });
}

// Initialize particles when garden scene is in view
const gardenScene = document.querySelector('.garden-scene');
if (gardenScene) {
    const sceneObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            createParticles();
            sceneObserver.disconnect();
        }
    }, { threshold: 0.3 });

    sceneObserver.observe(gardenScene);
}

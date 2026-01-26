// ===================================
// BHAKTHI PADALGAL - MAIN JAVASCRIPT
// ===================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initMobileMenu();
    initScreenshotsSlider();
    initHeroMediaCarousel();
    // Don't initialize separate videos section - videos are in screenshots now
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    
    // Hide the separate videos section since videos are in screenshots
    const videosSection = document.getElementById('videos');
    if (videosSection) {
        videosSection.style.display = 'none';
    }
});

// ===================================
// HERO MEDIA CAROUSEL
// ===================================
function initHeroMediaCarousel() {
    const carousel = document.querySelector('.media-carousel');
    const track = document.querySelector('.media-track');
    const prevBtn = document.querySelector('.hero-media-prev');
    const nextBtn = document.querySelector('.hero-media-next');
    
    if (!carousel || !track || !prevBtn || !nextBtn) return;

    function updateNavButtons() {
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
        const atStart = carousel.scrollLeft <= 1;
        const atEnd = carousel.scrollLeft >= maxScrollLeft - 1;
        prevBtn.classList.toggle('is-disabled', atStart);
        nextBtn.classList.toggle('is-disabled', atEnd);
        prevBtn.setAttribute('aria-disabled', atStart ? 'true' : 'false');
        nextBtn.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
    }
    
    function getScrollStep() {
        const card = track.querySelector('.phone-mockup');
        const gap = parseFloat(getComputedStyle(track).gap || '0');
        return (card ? card.offsetWidth : 320) + gap;
    }
    
    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateNavButtons);
    });

    window.addEventListener('resize', updateNavButtons);
    updateNavButtons();
}

// ===================================
// MOBILE MENU
// ===================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
}

// ===================================
// SCREENSHOTS SLIDER
// ===================================
function initScreenshotsSlider() {
    const slider = document.getElementById('screenshotsSlider');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (!slider) return;
    
    // Load screenshots from /images folder
    loadScreenshots(slider);
    
    // Slider navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        });
    }
    
    // Touch/swipe support for mobile
    let startX = 0;
    let scrollLeft = 0;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (!startX) return;
        
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
    
    slider.addEventListener('touchend', () => {
        startX = 0;
    });
}

// Load screenshots dynamically - NOW INCLUDES VIDEOS FIRST!
function loadScreenshots(container) {
    console.log('📸 Loading videos and images...');
    
    // FIRST: Try to load videos
    const videosToTry = [
        'video1.MP4',        
        'video2.MP4',
        'video3.MP4',
        'video4.MP4',
        'video5.MP4'
    ];
    
    let itemsLoaded = 0;
    let videosChecked = 0;
    const videoElements = []; // Store video elements to insert in order
    
    // Load videos FIRST
    videosToTry.forEach((filename, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'screenshot-item video-item';
        videoCard.dataset.order = index; // Track order
        
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        video.style.maxWidth = '300px';
        video.style.borderRadius = '12px';
        video.style.backgroundColor = '#000';
        
        const source = document.createElement('source');
        source.src = `videos/${filename}`;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
        video.addEventListener('loadedmetadata', () => {
            console.log(`✅ Found video: ${filename}`);
            videoElements.push({ element: videoCard, order: index });
            checkIfVideosComplete();
        });
        
        video.addEventListener('error', () => {
            console.log(`❌ Video not found: ${filename}`);
            checkIfVideosComplete();
        });
        
        videoCard.appendChild(video);
        
        videosChecked++;
    });
    
    function checkIfVideosComplete() {
        if (videosChecked === videosToTry.length) {
            // All videos checked, now add them in order
            videoElements.sort((a, b) => a.order - b.order);
            videoElements.forEach(vid => {
                container.appendChild(vid.element);
                itemsLoaded++;
            });
            
            console.log(`✅ Added ${videoElements.length} video(s) to screenshots section`);
            
            // NOW load images AFTER videos are added
            loadImages(container);
        }
    }
    
    // Trigger the check after a short delay to ensure all event listeners are set up
    setTimeout(checkIfVideosComplete, 100);
    
    // Function to load images AFTER videos
    function loadImages(container) {
        const extensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
        const foundImages = [];
        let checksCompleted = 0;
        const maxImagesToCheck = 50;
        
        function checkImage(index) {
            let extensionIndex = 0;
            
            function tryNextExtension() {
                if (extensionIndex >= extensions.length) {
                    checksCompleted++;
                    if (checksCompleted === maxImagesToCheck) {
                        displayImages();
                    }
                    return;
                }
                
                const img = new Image();
                const filename = `image${index}${extensions[extensionIndex]}`;
                img.src = `images/${filename}`;
                
                img.onload = () => {
                    foundImages.push({
                        index: index,
                        src: `images/${filename}`,
                        alt: `Bhakthi Padalgal Screenshot ${index}`
                    });
                    checksCompleted++;
                    if (checksCompleted === maxImagesToCheck) {
                        displayImages();
                    }
                };
                
                img.onerror = () => {
                    extensionIndex++;
                    tryNextExtension();
                };
            }
            
            tryNextExtension();
        }
        
        function displayImages() {
            if (foundImages.length === 0 && itemsLoaded === 0) {
                container.innerHTML = '<p style="text-align: center; color: #9CA3AF;">Screenshots will be displayed here</p>';
                return;
            }
            
            // Sort images by index
            foundImages.sort((a, b) => a.index - b.index);
            
            // Add images AFTER videos
            foundImages.forEach(imageData => {
                const img = document.createElement('img');
                img.src = imageData.src;
                img.alt = imageData.alt;
                img.loading = 'lazy';
                img.style.maxWidth = '300px';
                img.style.borderRadius = '12px';
                container.appendChild(img);
                itemsLoaded++;
            });
            
            console.log(`✅ Total items loaded: ${itemsLoaded} (videos + images)`);
        }
        
        for (let i = 1; i <= maxImagesToCheck; i++) {
            checkImage(i);
        }
    }
}

// ===================================
// VIDEOS GRID
// ===================================
function initVideosGrid() {
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) return;
    
    // Load videos from /videos folder
    loadVideos(videosGrid);
}

// Load videos dynamically - SIMPLIFIED VERSION THAT ACTUALLY WORKS
function loadVideos(container) {
    console.log('🎬 Starting video detection...');
    
    // List of videos to try - ADD YOUR VIDEO FILES HERE
    const videosToTry = [
        'video1.MP4',
        'video2.MP4', 
        'video3.MP4',
        'video4.MP4',
        'video5.MP4'
    ];
    
    let videosLoaded = 0;
    
    videosToTry.forEach((filename, index) => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.style.display = 'none'; // Hide until loaded
        
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        video.style.maxWidth = '600px';
        video.style.borderRadius = '12px';
        video.style.backgroundColor = '#000';
        
        const source = document.createElement('source');
        source.src = `videos/${filename}`;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
        // When video metadata loads, show it
        video.addEventListener('loadedmetadata', () => {
            console.log(`✅ Found video: ${filename}`);
            videoCard.style.display = 'block';
            videosLoaded++;
        });
        
        // If video fails to load, don't show it
        video.addEventListener('error', () => {
            console.log(`❌ Video not found: ${filename}`);
            videoCard.remove();
        });
        
        videoCard.appendChild(video);
        container.appendChild(videoCard);
    });
    
    // After 2 seconds, check if any videos loaded
    setTimeout(() => {
        if (videosLoaded === 0) {
            console.log('⚠️ No videos found. Hiding video section.');
            const videosSection = document.getElementById('videos');
            if (videosSection) {
                videosSection.style.display = 'none';
            }
        } else {
            console.log(`✅ Loaded ${videosLoaded} video(s)`);
        }
    }, 2000);
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.feature-card, .testimonial-card, .pricing-card, .contact-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 0) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// APP STORE LINK HANDLER
// ===================================
function handleAppStoreLink() {
    // Get all App Store buttons
    const appStoreButtons = document.querySelectorAll('a[href*="apps.apple.com"]');
    
    appStoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Analytics tracking (if you add analytics later)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'App Store',
                    'event_label': 'Download Button'
                });
            }
        });
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ===================================
// ERROR HANDLING
// ===================================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Error occurred:', e.message);
    // You can add error reporting here (e.g., to Sentry, LogRocket, etc.)
});

// ===================================
// ANALYTICS (OPTIONAL)
// ===================================

// Track page view
function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'page_title': document.title,
            'page_path': window.location.pathname
        });
    }
}

// Track custom events
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// ===================================
// INITIALIZE ON LOAD
// ===================================

// Additional initialization when page is fully loaded
window.addEventListener('load', () => {
    lazyLoadImages();
    handleAppStoreLink();
    trackPageView();
});

// ===================================
// SERVICE WORKER (OPTIONAL - FOR PWA)
// ===================================

// Register service worker if supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ===================================
// EXPORT FUNCTIONS (IF NEEDED)
// ===================================

// Make functions available globally if needed
window.BhakthiPadalgal = {
    trackEvent,
    trackPageView
};

/**
 * OmixCalculator Global Logic
 * Handles Mobile Menu, Search Toggle & Smart Sitemap Search
 * Optimized for PageSpeed 100/100 (Performance + Accessibility)
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchToggle();
    
    // TBT OPTIMIZATION:
    // Select ALL search inputs (Desktop Overlay + Mobile Menu)
    // We class-based selection (.tool-search-input) to handle both.
    const searchInputs = document.querySelectorAll('.tool-search-input');
    
    // Attach lazy loader to all inputs
    searchInputs.forEach(input => {
        // Load on focus (mobile/desktop click)
        input.addEventListener('focus', initSitemapSearch, { once: true });
        // Load on hover (desktop anticipation)
        input.addEventListener('mouseenter', initSitemapSearch, { once: true });
    });
});

// 1. GLOBAL MOBILE MENU
function initMobileMenu() {
    const menuBtn = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    const hamburgerLines = document.querySelectorAll('.hamburger-line');

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
        // Toggle Active Class
        const isActive = nav.classList.toggle('is-active');
        
        // ACCESSIBILITY: Tell screen readers the menu state
        menuBtn.setAttribute('aria-expanded', isActive);

        // Animate Hamburger
        if (isActive) {
            hamburgerLines[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
            hamburgerLines[1].style.opacity = '0';
            hamburgerLines[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            hamburgerLines[0].style.transform = 'none';
            hamburgerLines[1].style.opacity = '1';
            hamburgerLines[2].style.transform = 'none';
        }
    });
}

// 2. SEARCH TOGGLE (For Desktop Header Button)
function initSearchToggle() {
    const searchBtn = document.querySelector('.nav-search-btn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('toolSearch');

    if (!searchBtn || !searchOverlay) return;

    // Open Search
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = searchOverlay.classList.toggle('is-active');
        
        // ACCESSIBILITY: Update button state
        searchBtn.setAttribute('aria-expanded', isOpen);

        if (isOpen && searchInput) {
            // Slight delay to ensure visibility before focusing
            setTimeout(() => searchInput.focus(), 100);
        }
    });

    // Prevent closing when clicking inside the overlay input area
    searchOverlay.addEventListener('click', (e) => e.stopPropagation());

    // Close when clicking anywhere else on document
    document.addEventListener('click', () => {
        if (searchOverlay.classList.contains('is-active')) {
            closeSearch();
        }
    });

    // Close on Escape Key (Accessibility Requirement)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('is-active')) {
            closeSearch();
        }
    });

    function closeSearch() {
        searchOverlay.classList.remove('is-active');
        searchBtn.setAttribute('aria-expanded', 'false');
    }
}

// 3. SMART SITEMAP SEARCH (Updated for Multiple Inputs)
// Fetches sitemap.xml to create an instant search index
let isSearchInitialized = false; 

async function initSitemapSearch() {
    if (isSearchInitialized) return; 
    isSearchInitialized = true;

    // Select ALL search inputs
    const searchInputs = document.querySelectorAll('.tool-search-input');
    if (searchInputs.length === 0) return;

    // A. Fetch & Parse Sitemap ONCE
    let toolsIndex = [];
    try {
        const response = await fetch('/sitemap.xml'); 
        if (!response.ok) throw new Error("Sitemap not found");
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const locs = xml.querySelectorAll("loc");

        // Map XML nodes to a clean Title/URL object
        toolsIndex = Array.from(locs).map(node => {
            let url = node.textContent;
            
            // CLEAN URL FIX
            url = url.replace('/index.html', '/');

            // Extract slug
            const slug = url.split('/').filter(p => p).pop(); 
            
            // Format Title
            const title = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Home';
            
            return { title, url };
        });

    } catch (error) {
        console.warn("OmixSearch: Auto-indexing skipped (Sitemap missing or inaccessible).");
    }

    // B. Attach Logic to ALL Inputs (Mobile + Desktop)
    searchInputs.forEach(input => {
        // Create a unique dropdown for this specific input
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results-dropdown';
        
        // Ensure parent is relative for proper dropdown positioning
        if(getComputedStyle(input.parentNode).position === 'static') {
            input.parentNode.style.position = 'relative';
        }
        
        input.parentNode.appendChild(resultsContainer);

        // Listen for Typing
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            resultsContainer.innerHTML = ''; // Reset dropdown

            // 1. Local Page Filtering (Instant visual feedback on grids)
            filterVisiblePage(term);

            // 2. Global Search (Dropdown results from Sitemap)
            if (term.length > 1 && toolsIndex.length > 0) {
                const matches = toolsIndex.filter(tool => tool.title.toLowerCase().includes(term));
                
                if (matches.length > 0) {
                    resultsContainer.style.display = 'block';
                    
                    // Show top 5 matches
                    matches.slice(0, 5).forEach(tool => { 
                        const link = document.createElement('a');
                        link.href = tool.url;
                        link.className = 'search-result-item';
                        link.innerHTML = `<span aria-hidden="true">🔍</span> ${tool.title}`;
                        resultsContainer.appendChild(link);
                    });
                } else {
                    resultsContainer.style.display = 'none';
                }
            } else {
                resultsContainer.style.display = 'none';
            }
        });
    });

    // Helper: Hides/Shows cards currently on the page
    function filterVisiblePage(term) {
        const gridIds = ['popular-calcs', 'popular-gens', 'grid-layout', 'tile-grid'];
        
        gridIds.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            
            const cards = grid.querySelectorAll('.tool-card, .tool-tile, .student-card');
            Array.from(cards).forEach(card => {
                const title = card.textContent.toLowerCase();
                card.style.display = title.includes(term) ? 'flex' : 'none';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Scroll Animation (Fade In)
  const fadeElements = document.querySelectorAll('.fade-in');

  const checkVisibility = () => {
    const triggerBottom = window.innerHeight * 0.85;

    fadeElements.forEach(el => {
      const boxTop = el.getBoundingClientRect().top;
      if (boxTop < triggerBottom) {
        el.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', checkVisibility);
  checkVisibility(); // Check on load

  // Cast Filtering (For cast.html)
  const castCards = document.querySelectorAll('.cast-card');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Dynamic Cast Rendering (for cast.html and SpecialThanks.html)
  const castGrid = document.getElementById('dynamic-cast-grid') || document.getElementById('special-thanks-grid');
  const isSpecialThanks = !!document.getElementById('special-thanks-grid');

  if (castGrid && typeof castData !== 'undefined') {
    castGrid.innerHTML = '';
    
    // ページに応じたデータフィルタリング
    let pageData = [];
    if (isSpecialThanks) {
      pageData = castData.filter(cast => cast.role === 'クリエーター' || cast.role === 'スタッフ');
    } else {
      pageData = castData.filter(cast => cast.role !== 'クリエーター' && cast.role !== 'スタッフ');
    }
    
    // Sort Logic
    // 1: 女将
    // 2: IL (芸者・女中区別なし)
    // 3: 芸者
    // 4: 女中
    // 5: 支援者
    const getGroupPriority = (cast) => {
      if (cast.role === '女将') return 1;
      if (cast.is_il) return 2;
      if (cast.role === '芸者') return 3;
      if (cast.role === '女中') return 4;
      if (cast.role === 'スタッフ') return 5;
      if (cast.role === 'クリエーター') return 6;
      return 99;
    };

    const sortedData = [...pageData].sort((a, b) => {
      // 1. Group priority
      const pA = getGroupPriority(a);
      const pB = getGroupPriority(b);
      if (pA !== pB) return pA - pB;

      // 2. Status priority
      const statusA = a.status || 'active';
      const statusB = b.status || 'active';
      if (statusA === 'active' && statusB === 'inactive') return -1;
      if (statusA === 'inactive' && statusB === 'active') return 1;

      // 3. Manual Order
      const orderA = typeof a.order === 'number' ? a.order : 999999;
      const orderB = typeof b.order === 'number' ? b.order : 999999;
      if (orderA !== orderB) return orderA - orderB;

      // 4. Alphabetical Order (50音順)
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, 'ja');
    });

    sortedData.forEach(cast => {
      const card = document.createElement('div');
      const isInactive = (cast.status === 'inactive');
      card.className = 'cast-card fade-in visible';
      if (isInactive) card.classList.add('inactive-cast');
      
      card.setAttribute('data-category', cast.category);
      card.setAttribute('data-description', cast.description);
      
      let displayRole = cast.role;
      if (cast.is_il) {
        displayRole += '/IL';
      }
      
      const roleHtml = `<p class="cast-category">${displayRole}</p>`;

      card.innerHTML = `
        <div class="cast-img-wrapper" style="position: relative;">
            <img src="${cast.image}" alt="${cast.name}" class="cast-img">
        </div>
        <div class="cast-info">
            <h3 class="cast-name">${cast.name}</h3>
            ${roleHtml}
        </div>
      `;
      castGrid.appendChild(card);
    });

    // Dynamic filter button visibility: hide if category has no members
    if (filterBtns) {
      const activeCategories = new Set(pageData.map(c => c.category));
      filterBtns.forEach(btn => {
        const filterVal = btn.getAttribute('data-filter');
        if (filterVal !== 'all' && !activeCategories.has(filterVal)) {
          btn.style.display = 'none';
        } else {
          btn.style.display = 'inline-block';
        }
      });
    }
  }

  // Update castCards node list after dynamic rendering
  const allCastCards = document.querySelectorAll('.cast-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      allCastCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item img');

  if (lightbox && lightboxImg && closeBtn) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        lightbox.classList.add('show');
        lightboxImg.src = item.src;
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('show');
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('show');
      }
    });
  }

  // Cast Modal functionality
  const castModal = document.getElementById('cast-modal');
  const castModalClose = document.getElementById('cast-modal-close');
  const castModalImg = document.getElementById('cast-modal-img');
  const castModalName = document.getElementById('cast-modal-name');
  const castModalRole = document.getElementById('cast-modal-role');
  const castModalDesc = document.getElementById('cast-modal-desc');

  if (castModal) {
    // Event delegation for dynamically added cast cards
    document.body.addEventListener('click', (e) => {
      const card = e.target.closest('.cast-card');
      if (!card) return;

      const img = card.querySelector('.cast-img').src;
      const name = card.querySelector('.cast-name').textContent;
      const roleElement = card.querySelector('.cast-category');
      const role = roleElement ? roleElement.textContent : '';
      const desc = card.getAttribute('data-description') || '設定準備中...';

      castModalImg.src = img;
      castModalName.textContent = name;
      castModalRole.textContent = role;
      castModalDesc.textContent = desc;

      castModal.classList.add('show');
    });

    castModalClose.addEventListener('click', () => {
      castModal.classList.remove('show');
    });

    castModal.addEventListener('click', (e) => {
      if (e.target === castModal) {
        castModal.classList.remove('show');
      }
    });
  }

  // ==================== News System Logic ====================
  
  // News Modal Elements
  const newsModal = document.getElementById('news-modal');
  const newsModalClose = document.getElementById('news-modal-close');
  const newsModalDate = document.getElementById('news-modal-date');
  const newsModalBadge = document.getElementById('news-modal-badge');
  const newsModalTitle = document.getElementById('news-modal-title');
  const newsModalBody = document.getElementById('news-modal-body');

  function openNewsModal(newsItem) {
    if (!newsModal) return;

    newsModalDate.textContent = newsItem.date.replace(/-/g, '.');
    
    // Set up category display and badge classes
    newsModalBadge.textContent = newsItem.category_display || 'その他';
    newsModalBadge.className = 'news-badge'; // reset
    if (newsItem.category === 'event') {
      newsModalBadge.classList.add('badge-event');
    } else if (newsItem.category === 'product') {
      newsModalBadge.classList.add('badge-product');
    } else {
      newsModalBadge.classList.add('badge-news');
    }

    newsModalTitle.textContent = newsItem.title;
    
    // Render rich text content (support Quill HTML output and legacy plain text)
    if (newsItem.content.includes('<') && newsItem.content.includes('>')) {
      newsModalBody.innerHTML = newsItem.content;
    } else {
      newsModalBody.innerHTML = '';
      const paragraphs = newsItem.content.split('\n');
      paragraphs.forEach(pText => {
        const p = document.createElement('p');
        p.textContent = pText;
        newsModalBody.appendChild(p);
      });
    }

    newsModal.classList.add('show');
  }

  // Close news modal
  if (newsModal && newsModalClose) {
    newsModalClose.addEventListener('click', () => {
      newsModal.classList.remove('show');
    });

    newsModal.addEventListener('click', (e) => {
      if (e.target === newsModal) {
        newsModal.classList.remove('show');
      }
    });
  }

  // Render Homepage News Preview
  const homepageNewsPreview = document.getElementById('dynamic-news-preview');
  if (homepageNewsPreview && typeof newsData !== 'undefined') {
    homepageNewsPreview.innerHTML = '';

    // Sort newsData by date descending
    const sortedNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestNews = sortedNews.slice(0, 2);

    latestNews.forEach(item => {
      const row = document.createElement('div');
      row.className = 'news-row-item fade-in visible';
      
      let badgeClass = 'badge-news';
      if (item.category === 'event') badgeClass = 'badge-event';
      else if (item.category === 'product') badgeClass = 'badge-product';

      row.innerHTML = `
        <div class="news-meta">
          <span class="news-date">${item.date.replace(/-/g, '.')}</span>
          <span class="news-badge ${badgeClass}">${item.category_display || 'その他'}</span>
        </div>
        <div class="news-title-container">
          <span class="news-title-link" data-id="${item.id}">${item.title}</span>
        </div>
      `;

      // Click event for modal
      const link = row.querySelector('.news-title-link');
      link.addEventListener('click', () => {
        openNewsModal(item);
      });

      homepageNewsPreview.appendChild(row);
    });
  }

  // Render News Page List and Pagination
  const newsListContainer = document.getElementById('dynamic-news-list');
  const newsPaginationContainer = document.getElementById('news-pagination');

  if (newsListContainer && typeof newsData !== 'undefined') {
    let currentCategory = 'all';
    let currentYear = 'all';
    let currentPage = 1;
    const itemsPerPage = 12;

    const newsCategoryBtns = document.querySelectorAll('#news-category-filter .filter-btn');
    const newsYearFilterContainer = document.getElementById('news-year-filter');

    // Extract unique years from newsData
    const years = [...new Set(newsData.map(item => item.date.split('-')[0]))].sort((a, b) => b - a);

    // Initialize Year Filter Select
    const newsYearSelect = document.getElementById('news-year-filter');
    if (newsYearSelect) {
        newsYearSelect.innerHTML = '<option value="all">全期間</option>';

        years.forEach(year => {
            const opt = document.createElement('option');
            opt.value = year;
            opt.textContent = `${year}年`;
            newsYearSelect.appendChild(opt);
        });

        newsYearSelect.addEventListener('change', (e) => {
            currentYear = e.target.value;
            currentPage = 1; // reset page
            renderNewsList();
        });
    }

    function renderNewsList() {
      newsListContainer.innerHTML = '';

      // Sort newsData by date descending
      const sortedNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Filter news by both category and year
      const filteredNews = sortedNews.filter(item => {
        const matchCategory = (currentCategory === 'all') || (item.category === currentCategory);
        const matchYear = (currentYear === 'all') || (item.date.startsWith(currentYear));
        return matchCategory && matchYear;
      });

      // Pagination math
      const totalItems = filteredNews.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
      const pageItems = filteredNews.slice(startIndex, endIndex);

      if (pageItems.length === 0) {
        newsListContainer.innerHTML = '<div style="text-align: center; color: var(--color-text-muted); padding: 20px;">お知らせはありません。</div>';
        newsPaginationContainer.innerHTML = '';
        return;
      }

      // Render news rows
      pageItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'news-row-item fade-in visible';

        let badgeClass = 'badge-news';
        if (item.category === 'event') badgeClass = 'badge-event';
        else if (item.category === 'product') badgeClass = 'badge-product';

        row.innerHTML = `
          <div class="news-meta">
            <span class="news-date">${item.date.replace(/-/g, '.')}</span>
            <span class="news-badge ${badgeClass}">${item.category_display || 'その他'}</span>
          </div>
          <div class="news-title-container">
            <span class="news-title-link" data-id="${item.id}">${item.title}</span>
          </div>
        `;

        // Click event for modal
        const link = row.querySelector('.news-title-link');
        link.addEventListener('click', () => {
          openNewsModal(item);
        });

        newsListContainer.appendChild(row);
      });

      // Render pagination UI (Numbered Format)
      newsPaginationContainer.innerHTML = '';
      if (totalPages > 1) {
        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '前へ';
        prevBtn.disabled = (currentPage === 1);
        prevBtn.addEventListener('click', () => {
          currentPage--;
          renderNewsList();
          document.getElementById('news-list').scrollIntoView({ behavior: 'smooth' });
        });
        newsPaginationContainer.appendChild(prevBtn);

        // Number buttons
        for (let i = 1; i <= totalPages; i++) {
            const numBtn = document.createElement('button');
            numBtn.className = 'pagination-btn num-btn';
            if (i === currentPage) numBtn.classList.add('active');
            numBtn.textContent = i;
            numBtn.addEventListener('click', () => {
                currentPage = i;
                renderNewsList();
                document.getElementById('news-list').scrollIntoView({ behavior: 'smooth' });
            });
            newsPaginationContainer.appendChild(numBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = '次へ';
        nextBtn.disabled = (currentPage === totalPages);
        nextBtn.addEventListener('click', () => {
          currentPage++;
          renderNewsList();
          document.getElementById('news-list').scrollIntoView({ behavior: 'smooth' });
        });
        newsPaginationContainer.appendChild(nextBtn);
      }
    }

    // Category filter button event listeners
    newsCategoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        newsCategoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentCategory = btn.getAttribute('data-filter');
        currentPage = 1; // reset page
        renderNewsList();
      });
    });

    // Initial render
    renderNewsList();

    // Parse URL Parameter: news.html?id=X
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    if (paramId) {
      const match = newsData.find(item => item.id === paramId);
      if (match) {
        // Render it with a short timeout to let the page settle
        setTimeout(() => {
          openNewsModal(match);
        }, 300);
      }
    }
  }
});

// Frontend visitor tracking service
class VisitorTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startTime = Date.now();
    this.pageViews = 1;
    this.isTracking = false;
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track page view
  trackPageView(page, title = '', articleId = '') {
    if (this.isTracking) return;
    
    this.isTracking = true;
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    const trackingData = {
      sessionId: this.sessionId,
      page: page,
      pageTitle: title,
      articleId: articleId,
      duration: duration,
      pageViews: this.pageViews,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Send tracking data to backend
    this.sendTrackingData(trackingData);
    
    this.pageViews++;
    this.startTime = Date.now();
    this.isTracking = false;
  }

  // Track article view
  trackArticleView(articleId, articleTitle) {
    this.trackPageView(`/article/${articleId}`, articleTitle, articleId);
  }

  // Track conversion events
  trackConversion(type, value = '') {
    const conversionData = {
      sessionId: this.sessionId,
      conversion: type,
      conversionValue: value,
      timestamp: new Date().toISOString()
    };

    fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversionData)
    }).catch(error => {
      console.error('Error tracking conversion:', error);
    });
  }

  // Send tracking data to backend
  async sendTrackingData(data) {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      
      await fetch(`${API_BASE}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error sending tracking data:', error);
    }
  }

  // Track scroll depth
  trackScrollDepth() {
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track significant scroll milestones
        if (maxScroll >= 25 && maxScroll < 50) {
          this.trackConversion('scroll_25');
        } else if (maxScroll >= 50 && maxScroll < 75) {
          this.trackConversion('scroll_50');
        } else if (maxScroll >= 75 && maxScroll < 90) {
          this.trackConversion('scroll_75');
        } else if (maxScroll >= 90) {
          this.trackConversion('scroll_90');
        }
      }
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  // Track time on page
  trackTimeOnPage() {
    let timeOnPage = 0;
    const trackTime = () => {
      timeOnPage++;
      
      // Track time milestones
      if (timeOnPage === 30) {
        this.trackConversion('time_30s');
      } else if (timeOnPage === 60) {
        this.trackConversion('time_1m');
      } else if (timeOnPage === 180) {
        this.trackConversion('time_3m');
      } else if (timeOnPage === 300) {
        this.trackConversion('time_5m');
      }
    };

    const interval = setInterval(trackTime, 1000);
    
    // Clear interval when page is unloaded
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
      this.trackConversion('time_total', timeOnPage.toString());
    });
  }

  // Initialize tracking for the current page
  init() {
    // Track initial page view
    this.trackPageView(window.location.pathname, document.title);
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
    
    // Track clicks on important elements
    this.trackClicks();
  }

  // Track clicks on important elements
  trackClicks() {
    const trackClick = (event) => {
      const target = event.target;
      const tagName = target.tagName.toLowerCase();
      
      // Track clicks on links
      if (tagName === 'a') {
        this.trackConversion('link_click', target.href);
      }
      
      // Track clicks on buttons
      if (tagName === 'button' || target.classList.contains('btn')) {
        this.trackConversion('button_click', target.textContent || target.className);
      }
      
      // Track clicks on article cards
      if (target.closest('[data-article-id]')) {
        const articleId = target.closest('[data-article-id]').dataset.articleId;
        this.trackConversion('article_card_click', articleId);
      }
    };

    document.addEventListener('click', trackClick, { passive: true });
  }
}

// Create global instance
const visitorTracker = new VisitorTracker();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    visitorTracker.init();
  });
} else {
  visitorTracker.init();
}

export default visitorTracker;

import VisitorModel from '../models/visitor.js';
import { v4 as uuidv4 } from 'uuid';

// IP geolocation service (you can replace with a paid service for better accuracy)
const getLocationFromIP = async (ip) => {
  try {
    // Using a free service - replace with your preferred geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
        latitude: data.lat,
        longitude: data.lon
      };
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  }
  
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC',
    latitude: null,
    longitude: null
  };
};

// Parse user agent to extract browser and OS info
const parseUserAgent = (userAgent) => {
  const ua = userAgent || '';
  
  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  
  if (ua.includes('Chrome')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
    const match = ua.match(/Edge\/(\d+)/);
    browserVersion = match ? match[1] : '';
  }
  
  // OS detection
  let os = 'Unknown';
  let osVersion = '';
  
  if (ua.includes('Windows')) {
    os = 'Windows';
    if (ua.includes('Windows NT 10.0')) osVersion = '10';
    else if (ua.includes('Windows NT 6.3')) osVersion = '8.1';
    else if (ua.includes('Windows NT 6.1')) osVersion = '7';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+_\d+)/);
    osVersion = match ? match[1].replace('_', '.') : '';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android (\d+\.\d+)/);
    osVersion = match ? match[1] : '';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+_\d+)/);
    osVersion = match ? match[1].replace('_', '.') : '';
  }
  
  // Device detection
  let device = 'desktop';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device = 'mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    device = 'tablet';
  }
  
  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device
  };
};

// Extract UTM parameters from referrer
const extractUTMParams = (referrer) => {
  if (!referrer) return {};
  
  try {
    const url = new URL(referrer);
    return {
      utmSource: url.searchParams.get('utm_source'),
      utmMedium: url.searchParams.get('utm_medium'),
      utmCampaign: url.searchParams.get('utm_campaign'),
      utmTerm: url.searchParams.get('utm_term'),
      utmContent: url.searchParams.get('utm_content')
    };
  } catch (error) {
    return {};
  }
};

// Check if user agent is a bot
const isBot = (userAgent) => {
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
    'googlebot', 'bingbot', 'yandexbot', 'baiduspider'
  ];
  
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
};

// Visitor tracking middleware
export const trackVisitor = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers.referer || req.headers.referrer || '';
    
    // Skip bot tracking
    if (isBot(userAgent)) {
      return next();
    }
    
    // Generate session ID if not exists
    let sessionId = req.session?.visitorSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      if (!req.session) req.session = {};
      req.session.visitorSessionId = sessionId;
    }
    
    // Get location data
    const locationData = await getLocationFromIP(ip);
    
    // Parse user agent
    const deviceData = parseUserAgent(userAgent);
    
    // Extract UTM parameters
    const utmData = extractUTMParams(referrer);
    
    // Determine if this is a new or returning visitor
    const existingVisitor = await VisitorModel.findOne({ 
      sessionId: sessionId,
      ip: ip 
    }).sort({ visitDate: -1 });
    
    const isNewVisitor = !existingVisitor;
    const isReturningVisitor = existingVisitor && 
      (Date.now() - existingVisitor.lastVisit.getTime()) > 24 * 60 * 60 * 1000; // 24 hours
    
    // Create visitor record
    const visitorData = {
      sessionId,
      ip,
      userAgent,
      referrer,
      page: req.path,
      pageTitle: req.query.title || '',
      articleId: req.query.articleId || '',
      isNewVisitor,
      isReturningVisitor,
      visitDate: new Date(),
      firstVisit: isNewVisitor ? new Date() : existingVisitor?.firstVisit || new Date(),
      lastVisit: new Date(),
      ...locationData,
      ...deviceData,
      ...utmData
    };
    
    // Save visitor data (async, don't wait)
    VisitorModel.create(visitorData).catch(error => {
      console.error('Error saving visitor data:', error);
    });
    
    // Add visitor data to request for use in routes
    req.visitorData = visitorData;
    
    next();
  } catch (error) {
    console.error('Error in visitor tracking middleware:', error);
    next(); // Continue even if tracking fails
  }
};

// Track page view duration
export const trackPageView = async (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    try {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const sessionId = req.session?.visitorSessionId;
      
      if (sessionId) {
        await VisitorModel.findOneAndUpdate(
          { sessionId: sessionId, page: req.path },
          { 
            $inc: { 
              pageViews: 1,
              visitDuration: duration 
            },
            $set: { lastVisit: new Date() }
          }
        );
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  });
  
  next();
};

export default { trackVisitor, trackPageView };

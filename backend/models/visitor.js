import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    // Basic visitor info
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true }, // If user is logged in
    
    // Location data
    ip: { type: String, required: true, index: true },
    country: { type: String, index: true },
    region: { type: String, index: true },
    city: { type: String, index: true },
    timezone: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    
    // Device & Browser info
    userAgent: { type: String },
    browser: { type: String, index: true },
    browserVersion: { type: String },
    os: { type: String, index: true },
    osVersion: { type: String },
    device: { type: String, index: true }, // mobile, tablet, desktop
    screenResolution: { type: String },
    
    // Referral data
    referrer: { type: String },
    utmSource: { type: String, index: true },
    utmMedium: { type: String, index: true },
    utmCampaign: { type: String, index: true },
    utmTerm: { type: String },
    utmContent: { type: String },
    
    // Page tracking
    page: { type: String, required: true, index: true },
    pageTitle: { type: String },
    articleId: { type: String, index: true }, // If visiting an article
    
    // Session data
    visitDuration: { type: Number, default: 0 }, // in seconds
    pageViews: { type: Number, default: 1 },
    isNewVisitor: { type: Boolean, default: true },
    isReturningVisitor: { type: Boolean, default: false },
    
    // Timestamps
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    visitDate: { type: Date, default: Date.now, index: true },
    
    // Additional tracking
    language: { type: String },
    isBot: { type: Boolean, default: false },
    conversion: { type: String }, // newsletter_signup, article_read, etc.
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
VisitorSchema.index({ visitDate: 1, country: 1 });
VisitorSchema.index({ visitDate: 1, region: 1 });
VisitorSchema.index({ visitDate: 1, device: 1 });
VisitorSchema.index({ visitDate: 1, browser: 1 });
VisitorSchema.index({ visitDate: 1, os: 1 });
VisitorSchema.index({ sessionId: 1, visitDate: 1 });
VisitorSchema.index({ ip: 1, visitDate: 1 });

// Virtual for visit date (YYYY-MM-DD format)
VisitorSchema.virtual('visitDateFormatted').get(function() {
  return this.visitDate.toISOString().split('T')[0];
});

// Static method to get daily stats
VisitorSchema.statics.getDailyStats = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.aggregate([
    {
      $match: {
        visitDate: { $gte: startOfDay, $lte: endOfDay },
        isBot: false
      }
    },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' },
        totalPageViews: { $sum: '$pageViews' },
        avgVisitDuration: { $avg: '$visitDuration' },
        newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } },
        returningVisitors: { $sum: { $cond: ['$isReturningVisitor', 1, 0] } }
      }
    },
    {
      $project: {
        totalVisitors: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        totalPageViews: 1,
        avgVisitDuration: { $round: ['$avgVisitDuration', 2] },
        newVisitors: 1,
        returningVisitors: 1
      }
    }
  ]);
};

// Static method to get region stats
VisitorSchema.statics.getRegionStats = async function(dateRange) {
  const matchStage = {
    isBot: false
  };
  
  if (dateRange) {
    matchStage.visitDate = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          country: '$country',
          region: '$region'
        },
        visitors: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' },
        pageViews: { $sum: '$pageViews' },
        avgDuration: { $avg: '$visitDuration' }
      }
    },
    {
      $project: {
        country: '$_id.country',
        region: '$_id.region',
        visitors: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' },
        pageViews: 1,
        avgDuration: { $round: ['$avgDuration', 2] }
      }
    },
    { $sort: { visitors: -1 } }
  ]);
};

// Static method to get device/browser stats
VisitorSchema.statics.getDeviceStats = async function(dateRange) {
  const matchStage = {
    isBot: false
  };
  
  if (dateRange) {
    matchStage.visitDate = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          device: '$device',
          browser: '$browser',
          os: '$os'
        },
        visitors: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        device: '$_id.device',
        browser: '$_id.browser',
        os: '$_id.os',
        visitors: 1,
        uniqueVisitors: { $size: '$uniqueVisitors' }
      }
    },
    { $sort: { visitors: -1 } }
  ]);
};

const VisitorModel = mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
export default VisitorModel;

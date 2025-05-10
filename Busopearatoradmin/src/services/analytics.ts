import { query } from '@/integrations/neon/client';

// Fetch dashboard summary statistics
export const fetchDashboardStats = async (params) => {
  try {
    const { startDate, endDate } = params || {};
    
    let sqlQuery = `
      SELECT 
        COUNT(DISTINCT b.id) AS total_bookings,
        SUM(b.total_fare) AS total_revenue,
        COUNT(DISTINCT b.user_id) AS total_passengers,
        COUNT(DISTINCT s.route_id) AS active_routes,
        COUNT(DISTINCT s.bus_id) AS fleet_size
      FROM bookings b
      JOIN schedules s ON b.schedule_id = s.id
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE b.created_at BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    // Get current stats
    const result = await query(sqlQuery, queryParams);
    
    // Get previous period stats for growth calculation
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(endDate);
    const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
    prevStartDate.setTime(prevStartDate.getTime() - timeDiff);
    prevEndDate.setTime(prevEndDate.getTime() - timeDiff);
    
    let prevSqlQuery = sqlQuery.replace('WHERE b.created_at BETWEEN $1 AND $2', 'WHERE b.created_at BETWEEN $1 AND $2');
    const prevResult = await query(prevSqlQuery, [prevStartDate.toISOString(), prevEndDate.toISOString()]);
    
    const current = result.rows[0];
    const previous = prevResult.rows[0];
    
    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    return {
      total_revenue: current.total_revenue || 0,
      total_passengers: current.total_passengers || 0,
      active_routes: current.active_routes || 0,
      fleet_size: current.fleet_size || 0,
      revenue_growth: calculateGrowth(current.total_revenue, previous.total_revenue),
      passenger_growth: calculateGrowth(current.total_passengers, previous.total_passengers),
      route_growth: calculateGrowth(current.active_routes, previous.active_routes),
      fleet_growth: calculateGrowth(current.fleet_size, previous.fleet_size)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Fetch revenue data for charts
export const fetchRevenueData = async (params) => {
  try {
    const { period = 'month', startDate, endDate } = params || {};
    
    let timeFormat;
    let groupBy;
    
    if (period === 'day') {
      timeFormat = 'YYYY-MM-DD';
      groupBy = 'DATE(b.booking_date)';
    } else if (period === 'week') {
      timeFormat = 'IYYY-IW';
      groupBy = 'TO_CHAR(b.booking_date, \'IYYY-IW\')';
    } else if (period === 'quarter') {
      timeFormat = 'YYYY-Q';
      groupBy = 'TO_CHAR(b.booking_date, \'YYYY-"Q"Q\')';
    } else {
      // Default to month
      timeFormat = 'YYYY-MM';
      groupBy = 'TO_CHAR(b.booking_date, \'YYYY-MM\')';
    }
    
    let sqlQuery = `
      SELECT 
        ${groupBy} AS time_period,
        SUM(b.total_fare) AS revenue,
        COUNT(DISTINCT b.id) AS bookings,
        COUNT(DISTINCT b.user_id) AS passengers
      FROM bookings b
      JOIN schedules s ON b.schedule_id = s.id
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE b.booking_date BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    sqlQuery += ` GROUP BY time_period ORDER BY time_period`;
    
    const result = await query(sqlQuery, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Fetch route performance data
export const fetchRoutePerformance = async (params) => {
  try {
    const { startDate, endDate } = params || {};
    
    let sqlQuery = `
      SELECT 
        r.id,
        r.name,
        r.origin,
        r.destination,
        COUNT(b.id) AS total_bookings,
        SUM(b.total_fare) AS total_revenue,
        AVG(
          CASE 
            WHEN b.seat_numbers IS NULL OR b.seat_numbers = '' THEN 0
            ELSE LENGTH(b.seat_numbers) - LENGTH(REPLACE(b.seat_numbers, ',', '')) + 1
          END
        ) AS avg_seats_per_booking,
        COUNT(b.id) * 100.0 / NULLIF(COUNT(s.id), 0) AS occupancy_rate
      FROM routes r
      JOIN schedules s ON r.id = s.route_id
      LEFT JOIN bookings b ON s.id = b.schedule_id
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE b.booking_date BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    sqlQuery += ` GROUP BY r.id, r.name, r.origin, r.destination
                  ORDER BY total_revenue DESC`;
    
    const result = await query(sqlQuery, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error fetching route performance:', error);
    throw error;
  }
};

// Fetch booking status distribution
export const fetchBookingStatusDistribution = async (params) => {
  try {
    const { startDate, endDate } = params || {};
    
    let sqlQuery = `
      SELECT 
        status,
        COUNT(*) AS count,
        SUM(total_fare) AS revenue
      FROM bookings b
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE b.booking_date BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    sqlQuery += ` GROUP BY status ORDER BY count DESC`;
    
    const result = await query(sqlQuery, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error fetching booking status distribution:', error);
    throw error;
  }
};

// Fetch payment method distribution
export const fetchPaymentMethodDistribution = async (params) => {
  try {
    const { startDate, endDate } = params || {};
    
    let sqlQuery = `
      SELECT 
        payment_method,
        COUNT(*) AS count,
        SUM(total_fare) AS revenue
      FROM bookings b
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE b.booking_date BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    sqlQuery += ` GROUP BY payment_method ORDER BY count DESC`;
    
    const result = await query(sqlQuery, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error fetching payment method distribution:', error);
    throw error;
  }
};

// Fetch bus type distribution data
export const fetchBusTypeDistribution = async (params) => {
  try {
    const { startDate, endDate } = params || {};
    
    let sqlQuery = `
      SELECT 
        b.model AS bus_type,
        COUNT(DISTINCT s.id) AS schedule_count,
        COUNT(bk.id) AS booking_count,
        SUM(bk.total_fare) AS total_revenue
      FROM buses b
      JOIN schedules s ON b.id = s.bus_id
      LEFT JOIN bookings bk ON s.id = bk.schedule_id
    `;
    
    const queryParams = [];
    if (startDate && endDate) {
      sqlQuery += ` WHERE bk.booking_date BETWEEN $1 AND $2`;
      queryParams.push(startDate, endDate);
    }
    
    sqlQuery += ` GROUP BY b.model ORDER BY booking_count DESC`;
    
    const result = await query(sqlQuery, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error fetching bus type distribution:', error);
    throw error;
  }
};

// Generate and download reports
export const generateReport = async (params) => {
  try {
    const { reportType, startDate, endDate, format = 'csv' } = params || {};
    
    // This function would typically generate a report file on the server
    // For client-side generation, we'll fetch the data and return it
    let data;
    
    switch (reportType) {
      case 'revenue':
        data = await fetchRevenueData({ startDate, endDate });
        break;
      case 'routes':
        data = await fetchRoutePerformance({ startDate, endDate });
        break;
      case 'buses':
        data = await fetchBusTypeDistribution({ startDate, endDate });
        break;
      default:
        data = await fetchDashboardStats({ startDate, endDate });
    }
    
    // In a real implementation, you would convert this data to CSV/PDF
    // For now, we'll just return the JSON data as a blob
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

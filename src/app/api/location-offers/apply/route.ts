import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import GeolocationService from '@/lib/geolocation';

interface ApplyOfferRequest {
  locationId: string;
  orderAmount: number;
  customerData?: {
    id?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ApplyOfferRequest = await request.json();
    const { locationId, orderAmount, customerData, items = [] } = body;

    if (!locationId || orderAmount === undefined) {
      return NextResponse.json({ error: 'Location ID and order amount are required' }, { status: 400 });
    }

    // Get location details
    const location = await db.location.findUnique({
      where: { id: locationId },
      include: {
        locationOffers: {
          where: {
            isActive: true,
            OR: [
              { startDate: null, endDate: null },
              { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
              { startDate: { lte: new Date() }, endDate: null },
              { startDate: null, endDate: { gte: new Date() } }
            ]
          }
        }
      }
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check customer eligibility for location-based offers
    let isEligibleForLocationOffers = true;
    let customerDistance: number | null = null;

    if (customerData && (customerData.latitude || customerData.longitude)) {
      // Check if customer is within delivery radius
      const geoService = GeolocationService.getInstance();
      customerDistance = geoService.calculateDistance(
        customerData.latitude || location.latitude,
        customerData.longitude || location.longitude,
        location.latitude,
        location.longitude
      );

      isEligibleForLocationOffers = customerDistance <= (location.deliveryRadius || 10);
    } else if (customerData && (customerData.city || customerData.pincode)) {
      // Check if customer is in the same city or pincode service area
      const sameCity = customerData.city?.toLowerCase() === location.city.toLowerCase();
      const samePincode = customerData.pincode === location.pincode;
      isEligibleForLocationOffers = sameCity || samePincode;
    }

    // Filter and calculate applicable offers
    const applicableOffers = location.locationOffers.filter(offer => {
      // Check minimum order amount
      if (offer.minOrderAmount && orderAmount < offer.minOrderAmount) {
        return false;
      }

      // Check usage limit
      if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
        return false;
      }

      // Check location eligibility
      if (!isEligibleForLocationOffers) {
        return false;
      }

      // Check target customer conditions
      if (offer.targetCustomers) {
        const targetConditions = JSON.parse(offer.targetCustomers);
        
        // Check customer type conditions
        if (targetConditions.customerTypes && customerData) {
          // This would typically check against customer data in the database
          // For now, we'll assume the customer is eligible
        }

        // Check order conditions
        if (targetConditions.orderConditions && items.length > 0) {
          const { minimumItems, specificCategories, minimumOrderValue } = targetConditions.orderConditions;
          
          if (minimumItems && items.length < minimumItems) {
            return false;
          }

          if (specificCategories && specificCategories.length > 0) {
            const orderCategories = items.map(item => item.category).filter(Boolean);
            const hasRequiredCategory = specificCategories.some((cat: string) => 
              orderCategories.includes(cat)
            );
            if (!hasRequiredCategory) {
              return false;
            }
          }

          if (minimumOrderValue && orderAmount < minimumOrderValue) {
            return false;
          }
        }
      }

      return true;
    });

    // Calculate discount for each applicable offer
    const offersWithDiscount = applicableOffers.map(offer => {
      let discountAmount = 0;

      switch (offer.type) {
        case 'PERCENTAGE':
          discountAmount = Math.min(
            (orderAmount * offer.value) / 100,
            offer.maxDiscountAmount || Infinity
          );
          break;
        case 'FIXED_AMOUNT':
          discountAmount = Math.min(offer.value, orderAmount);
          break;
        case 'FREE_DELIVERY':
          // This would typically be handled separately in delivery fee calculation
          discountAmount = 0; // No direct discount, but delivery fee would be waived
          break;
        case 'BUY_ONE_GET_ONE':
          // Find the cheapest eligible item for BOGO
          const eligibleItems = items.filter(item => {
            if (!offer.conditions) return false;
            const conditions = JSON.parse(offer.conditions);
            return conditions.applicableCategories?.includes(item.category) || 
                   conditions.applicableItems?.includes(item.id);
          });
          
          if (eligibleItems.length > 0) {
            const cheapestItem = eligibleItems.reduce((min, item) => 
              item.price < min.price ? item : min, eligibleItems[0]
            );
            discountAmount = cheapestItem.price;
          }
          break;
        case 'COMBO_OFFER':
          // Calculate combo discount based on conditions
          if (offer.conditions) {
            const conditions = JSON.parse(offer.conditions);
            if (conditions.requiredItems && conditions.requiredItems.length > 0) {
              const hasRequiredItems = conditions.requiredItems.every((reqItem: any) =>
                items.some(item => item.id === reqItem.id || item.category === reqItem.category)
              );
              if (hasRequiredItems) {
                discountAmount = conditions.discountAmount || offer.value;
              }
            }
          }
          break;
        default:
          discountAmount = 0;
      }

      return {
        ...offer,
        discountAmount,
        conditions: offer.conditions ? JSON.parse(offer.conditions) : null,
        targetCustomers: offer.targetCustomers ? JSON.parse(offer.targetCustomers) : null
      };
    }).filter(offer => offer.discountAmount > 0 || offer.type === 'FREE_DELIVERY');

    // Sort offers by discount amount (highest first)
    offersWithDiscount.sort((a, b) => b.discountAmount - a.discountAmount);

    // Return the best offer and all applicable offers
    const bestOffer = offersWithDiscount.length > 0 ? offersWithDiscount[0] : null;

    return NextResponse.json({
      bestOffer,
      applicableOffers: offersWithDiscount,
      locationEligibility: {
        isEligible: isEligibleForLocationOffers,
        distance: customerDistance,
        deliveryRadius: location.deliveryRadius
      },
      summary: {
        originalAmount: orderAmount,
        bestDiscount: bestOffer?.discountAmount || 0,
        finalAmount: orderAmount - (bestOffer?.discountAmount || 0),
        savingsPercentage: bestOffer ? ((bestOffer.discountAmount / orderAmount) * 100).toFixed(1) : '0'
      }
    });

  } catch (error) {
    console.error('Error applying location offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
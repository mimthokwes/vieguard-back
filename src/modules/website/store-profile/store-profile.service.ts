import { prisma } from '../../../config/prisma';
import { RedisService } from '../../../shared/services/redis.service';

export class WebsiteStoreProfileService {
  static async getProfile() {
    const cacheKey = 'store_profile:main_v3';
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const [
      profile,
      totalModels,
      totalPurchaseModels,
      totalRentalModels,
      totalCategories,
      totalOrdersCompleted,
      totalTestimonials,
    ] = await Promise.all([
      prisma.storeProfile.findFirst(),
      prisma.product.count({ where: { deletedAt: null, isVisible: true } }),
      prisma.product.count({ where: { deletedAt: null, isVisible: true, basePriceBuy: { not: null, gt: 0 } } }),
      prisma.product.count({ where: { deletedAt: null, isVisible: true, basePriceRent: { not: null, gt: 0 } } }),
      prisma.category.count(),
      prisma.order.count({ where: { status: 'selesai' } }),
      prisma.testimonial.count(),
    ]);

    const result = {
      ...(profile ? profile : {}),
      stats: {
        totalModels,
        totalPurchaseModels,
        totalRentalModels,
        totalCategories,
        totalOrdersCompleted,
        totalTestimonials,
      },
    };

    await RedisService.set(cacheKey, result, 3600);
    return result;
  }
}


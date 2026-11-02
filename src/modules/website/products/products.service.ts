import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { checkRentalAvailability } from '../../../shared/services/rentalAvailability';
import { RedisService } from '../../../shared/services/redis.service';
import { rankProductsWithSmartQuery } from './products.search';

function determineProductType(p: { basePriceBuy?: any; basePriceRent?: any }): 'beli' | 'sewa' | 'both' {
  const hasBuy = p.basePriceBuy !== null && p.basePriceBuy !== undefined && Number(p.basePriceBuy) > 0;
  const hasRent = p.basePriceRent !== null && p.basePriceRent !== undefined && Number(p.basePriceRent) > 0;
  if (hasBuy && hasRent) return 'both';
  if (hasBuy) return 'beli';
  if (hasRent) return 'sewa';
  return 'beli';
}

export class WebsiteProductsService {
  static async getAll(query: { categoryId?: string; search?: string; minPrice?: string; maxPrice?: string; type?: string }) {
    const cacheKey = `products:website:all:${JSON.stringify(query)}`;
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const where: any = {
      deletedAt: null,
      isVisible: true,
    };

    if (query.categoryId) {
      where.categoryId = BigInt(query.categoryId);
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.type === 'beli') {
      where.basePriceBuy = {
        not: null,
        gt: 0,
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    } else if (query.type === 'sewa') {
      where.basePriceRent = {
        not: null,
        gt: 0,
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    } else if (query.minPrice || query.maxPrice) {
      where.basePriceBuy = {
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products.map((p) => ({
      ...p,
      productType: determineProductType(p),
    }));

    await RedisService.set(cacheKey, formatted, 1800); // 30 mins TTL
    return formatted;
  }

  static async getById(id: bigint) {
    const cacheKey = `products:detail:${id.toString()}`;
    const cached = await RedisService.get(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null, isVisible: true },
      include: {
        category: true,
        images: true,
        variants: { where: { deletedAt: null } },
      },
    });

    if (!product) throw new AppError('Produk tidak ditemukan', 404);

    const formatted = {
      ...product,
      productType: determineProductType(product),
    };

    await RedisService.set(cacheKey, formatted, 1800);
    return formatted;
  }


  static async getAvailability(productId: bigint, variantId: bigint | null, pickupDateStr: string, returnDateStr: string) {
    const pickupDate = new Date(pickupDateStr);
    const returnDate = new Date(returnDateStr);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      throw new AppError('Tanggal pickup atau return tidak valid', 400);
    }

    if (pickupDate > returnDate) {
      throw new AppError('Tanggal pickup harus sebelum atau sama dengan tanggal return', 400);
    }

    return checkRentalAvailability(productId, variantId, pickupDate, returnDate);
  }

  static async smartSearch(query: { q?: string; categoryId?: string; type?: string; minPrice?: string; maxPrice?: string }) {
    const rawQuery = (query.q || '').trim();

    const where: any = {
      deletedAt: null,
      isVisible: true,
    };

    if (query.categoryId) {
      where.categoryId = BigInt(query.categoryId);
    }

    if (query.type === 'beli') {
      where.basePriceBuy = {
        not: null,
        gt: 0,
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    } else if (query.type === 'sewa') {
      where.basePriceRent = {
        not: null,
        gt: 0,
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    } else if (query.minPrice || query.maxPrice) {
      where.basePriceBuy = {
        ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {}),
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products.map((p) => ({
      ...p,
      productType: determineProductType(p),
    }));

    if (!rawQuery) {
      return {
        products: formatted,
        explanation: {
          suggestedQuery: '',
          intention: undefined,
          matchedTerms: [],
        },
      };
    }

    const { results, explanation } = rankProductsWithSmartQuery(formatted, rawQuery);

    return {
      products: results,
      explanation,
    };
  }
}

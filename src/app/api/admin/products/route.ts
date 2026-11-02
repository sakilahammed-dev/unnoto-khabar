import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';
import { PRODUCTS_CATALOG, MASTER_CATEGORIES } from '@/data/catalog';

// Helper to authenticate admin
function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const cookieToken = req.cookies.get('admin_token')?.value || '';
  const token = authHeader.replace('Bearer ', '') || cookieToken;
  return verifySessionToken(token);
}

// GET: Fetch all products with database overrides
export async function GET(req: NextRequest) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    // 1. Get overrides and custom products from database
    const [overrides, customProducts] = await Promise.all([
      prisma.productOverride.findMany(),
      prisma.customProduct.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    const overrideMap = new Map(overrides.map((o) => [o.productId, o]));

    // 2. Flatten base catalog items
    const baseItems = PRODUCTS_CATALOG.flatMap((prod) => {
      return prod.variants.map((v) => {
        const itemKey = `${prod.id}_${v.weight}`;
        const override = overrideMap.get(itemKey) || overrideMap.get(prod.id);

        return {
          id: prod.id,
          variantId: v.id,
          itemKey,
          name: prod.name,
          banglaName: prod.banglaName,
          category: prod.category,
          categoryName: prod.categoryName,
          weight: v.weight,
          imageUrl: prod.imageUrl,
          price: override?.customPrice !== null && override?.customPrice !== undefined ? override.customPrice : v.price,
          originalPrice: override?.originalPrice !== null && override?.originalPrice !== undefined ? override.originalPrice : v.originalPrice,
          inStock: override?.inStock !== undefined ? override.inStock : v.inStock,
          isOffer: override?.isOffer !== null && override?.isOffer !== undefined ? override.isOffer : prod.isOffer,
          badge: override?.badge !== undefined ? override.badge : prod.badge,
          isCustom: false,
        };
      });
    });

    // 3. Format custom products
    const customItems = customProducts.map((p) => ({
      id: p.id,
      variantId: p.id,
      itemKey: p.id,
      name: p.name,
      banglaName: p.banglaName,
      category: p.category,
      categoryName: p.categoryName,
      weight: p.weight,
      imageUrl: p.imageUrl,
      price: p.price,
      originalPrice: p.originalPrice,
      inStock: p.inStock,
      isOffer: p.isOffer,
      badge: p.badge,
      isCustom: true,
    }));

    const allProducts = [...customItems, ...baseItems];

    return NextResponse.json({
      success: true,
      products: allProducts,
      categories: MASTER_CATEGORIES,
      totalCount: allProducts.length,
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

// POST: Add new custom product from admin
export async function POST(req: NextRequest) {
  try {
    const session = authenticate(req);
    if (!session) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশ।' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      banglaName,
      category,
      weight,
      price,
      originalPrice,
      imageUrl,
      shortDescription,
      badge,
      isOffer = false,
    } = body;

    if (!banglaName || !price || !weight) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে পণ্যের বাংলা নাম, ওজন এবং মূল্য দিন।' },
        { status: 400 }
      );
    }

    const matchedCat = MASTER_CATEGORIES.find((c) => c.id === category) || {
      id: 'special-offers',
      banglaName: 'বিশেষ পণ্য',
    };

    const numPrice = Math.max(0, parseInt(price, 10) || 0);
    const numOrig = Math.max(numPrice, parseInt(originalPrice, 10) || numPrice);

    const created = await prisma.customProduct.create({
      data: {
        name: name ? name.trim() : banglaName.trim(),
        banglaName: banglaName.trim(),
        category: matchedCat.id,
        categoryName: matchedCat.banglaName,
        shortDescription: shortDescription ? shortDescription.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : '/products/sundarban_raw_honey.png',
        weight: weight.trim(),
        price: numPrice,
        originalPrice: numOrig,
        inStock: true,
        isOffer: Boolean(isOffer),
        badge: badge ? badge.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'নতুন পণ্য সফলভাবে যুক্ত করা হয়েছে!',
      product: created,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'নতুন পণ্য যুক্ত করতে ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}

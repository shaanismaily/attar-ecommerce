import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return undefined;
};

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    tagline,
    description,
    categoryId,
    gender,
    fragranceNotes,
    longevity,
    sillage,
    concentration,
    isPublished,
    isBestSeller,
    isFeatured,
    isNewArrival,
  } = req.body;

  // ------------------------------------------
  // Basic validation
  // ------------------------------------------

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Product name is required");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new ApiError(400, "Product description is required");
  }

  if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, "Invalid category");
  }

  // ------------------------------------------
  // Gender validation
  // ------------------------------------------

  const allowedGenders = ["men", "women", "unisex"] as const;

  type Gender = (typeof allowedGenders)[number];

  if (
    typeof gender !== "string" ||
    !allowedGenders.includes(gender as Gender)
  ) {
    throw new ApiError(400, "Invalid gender");
  }

  const validatedGender = gender as Gender;

  // ------------------------------------------
  // Fragrance details validation
  // ------------------------------------------

  if (typeof longevity !== "string" || !longevity.trim()) {
    throw new ApiError(400, "Longevity is required");
  }

  if (typeof sillage !== "string" || !sillage.trim()) {
    throw new ApiError(400, "Sillage is required");
  }

  if (typeof concentration !== "string" || !concentration.trim()) {
    throw new ApiError(400, "Concentration is required");
  }

  // ------------------------------------------
  // Parse fragrance notes
  // ------------------------------------------

  let parsedFragranceNotes;

  try {
    parsedFragranceNotes =
      typeof fragranceNotes === "string"
        ? JSON.parse(fragranceNotes)
        : fragranceNotes;
  } catch {
    throw new ApiError(400, "Invalid fragrance notes format");
  }

  if (!parsedFragranceNotes || typeof parsedFragranceNotes !== "object") {
    throw new ApiError(400, "Fragrance notes are required");
  }

  const { top, heart, base } = parsedFragranceNotes;

  if (!top || !heart || !base) {
    throw new ApiError(400, "Top, heart and base notes are required");
  }

  // ------------------------------------------
  // Validate note arrays
  // ------------------------------------------

  const isValidNoteSection = (
    section: unknown
  ): section is {
    description?: string;
    notes: string[];
  } => {
    if (!section || typeof section !== "object") {
      return false;
    }

    const value = section as Record<string, unknown>;

    return (
      Array.isArray(value.notes) &&
      value.notes.length > 0 &&
      value.notes.every(
        (note) => typeof note === "string" && note.trim().length > 0
      ) &&
      (value.description === undefined || typeof value.description === "string")
    );
  };

  if (
    !isValidNoteSection(top) ||
    !isValidNoteSection(heart) ||
    !isValidNoteSection(base)
  ) {
    throw new ApiError(400, "Invalid fragrance notes");
  }

  // ------------------------------------------
  // Generate slug
  // ------------------------------------------

  const generatedSlug = slugify(name, {
    lower: true,
    strict: true,
  });

  // ------------------------------------------
  // Check duplicate product
  // ------------------------------------------

  const existedProduct = await Product.findOne({
    slug: generatedSlug,
  });

  if (existedProduct) {
    throw new ApiError(409, "Product already exists");
  }

  // ------------------------------------------
  // Check category
  // ------------------------------------------

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // ------------------------------------------
  // Images
  // ------------------------------------------

  const imageFiles = req.files as Express.Multer.File[];

  if (!imageFiles || imageFiles.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  type ImageUrl = {
    url: string;
    publicId: string;
  };

  const imageUrls: ImageUrl[] = [];

  for (const file of imageFiles) {
    const uploadedImage = await uploadOnCloudinary(file.path);

    if (!uploadedImage) {
      throw new ApiError(500, "Failed to upload image");
    }

    imageUrls.push({
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    });
  }

  // ------------------------------------------
  // Parse booleans
  // ------------------------------------------

  const featured = parseBoolean(isFeatured);

  const bestSeller = parseBoolean(isBestSeller);

  const newArrival = parseBoolean(isNewArrival);

  const published = parseBoolean(isPublished);

  // ------------------------------------------
  // Create product
  // ------------------------------------------

  const product = await Product.create({
    name: name.trim(),

    ...(typeof tagline === "string" &&
      tagline.trim() && {
        tagline: tagline.trim(),
      }),

    description: description.trim(),

    category: categoryId,

    gender: validatedGender,

    fragranceNotes: {
      top: {
        description: top.description?.trim(),
        notes: top.notes.map((note) => note.trim()),
      },

      heart: {
        description: heart.description?.trim(),
        notes: heart.notes.map((note) => note.trim()),
      },

      base: {
        description: base.description?.trim(),
        notes: base.notes.map((note) => note.trim()),
      },
    },

    longevity: longevity.trim(),
    sillage: sillage.trim(),
    concentration: concentration.trim(),

    images: imageUrls,

    isFeatured: featured,
    isBestSeller: bestSeller,
    isNewArrival: newArrival,
    isPublished: published,
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating a product");
  }

  // ------------------------------------------
  // Populate category
  // ------------------------------------------

  const createdProduct = await Product.findById(product._id).populate(
    "category",
    "name slug"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdProduct, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        tagline,
        description,
        category,
        gender,
        fragranceNotes,
        longevity,
        sillage,
        concentration,
        isFeatured,
        isNewArrival,
        isPublished,
        isBestSeller,
    } = req.body;

    const { productId } = req.params;

    // ------------------------------------------
    // Check if at least one field is provided
    // ------------------------------------------

    const hasUpdate =
        name !== undefined ||
        tagline !== undefined ||
        description !== undefined ||
        category !== undefined ||
        gender !== undefined ||
        fragranceNotes !== undefined ||
        longevity !== undefined ||
        sillage !== undefined ||
        concentration !== undefined ||
        isFeatured !== undefined ||
        isNewArrival !== undefined ||
        isPublished !== undefined ||
        isBestSeller !== undefined;

    if (!hasUpdate) {
        throw new ApiError(
            400,
            "At least one field is required"
        );
    }

    // ------------------------------------------
    // Find product
    // ------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }

    // ------------------------------------------
    // Name + slug
    // ------------------------------------------

    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            throw new ApiError(
                400,
                "Product name cannot be empty"
            );
        }

        const newSlug = slugify(name, {
            lower: true,
            strict: true,
        });

        const existingProduct =
            await Product.findOne({
                slug: newSlug,
                _id: { $ne: product._id },
            });

        if (existingProduct) {
            throw new ApiError(
                409,
                "A product with this name already exists"
            );
        }

        product.name = name.trim();
    }

    // ------------------------------------------
    // Tagline
    // ------------------------------------------

    if (tagline !== undefined) {
        if (
            typeof tagline !== "string"
        ) {
            throw new ApiError(
                400,
                "Invalid tagline"
            );
        }

        // Allow empty tagline to remove it
        product.tagline =
            tagline.trim() || undefined;
    }

    // ------------------------------------------
    // Description
    // ------------------------------------------

    if (description !== undefined) {
        if (
            typeof description !== "string" ||
            !description.trim()
        ) {
            throw new ApiError(
                400,
                "Product description cannot be empty"
            );
        }

        product.description =
            description.trim();
    }

    // ------------------------------------------
    // Category
    // ------------------------------------------

    if (category !== undefined) {
        if (
            typeof category !== "string" ||
            !mongoose.isValidObjectId(category)
        ) {
            throw new ApiError(
                400,
                "Invalid category"
            );
        }

        const categoryExists =
            await Category.findById(category);

        if (!categoryExists) {
            throw new ApiError(
                404,
                "Category not found"
            );
        }

        product.category = categoryExists._id;
    }

    // ------------------------------------------
    // Gender
    // ------------------------------------------

    if (gender !== undefined) {
        const allowedGenders = [
            "men",
            "women",
            "unisex",
        ] as const;

        type Gender =
            (typeof allowedGenders)[number];

        if (
            typeof gender !== "string" ||
            !allowedGenders.includes(
                gender as Gender
            )
        ) {
            throw new ApiError(
                400,
                "Invalid gender"
            );
        }

        product.gender = gender as Gender;
    }

    // ------------------------------------------
    // Fragrance notes
    // ------------------------------------------

    if (fragranceNotes !== undefined) {
        let parsedFragranceNotes;

        try {
            parsedFragranceNotes =
                typeof fragranceNotes === "string"
                    ? JSON.parse(fragranceNotes)
                    : fragranceNotes;
        } catch {
            throw new ApiError(
                400,
                "Invalid fragrance notes format"
            );
        }

        if (
            !parsedFragranceNotes ||
            typeof parsedFragranceNotes !== "object"
        ) {
            throw new ApiError(
                400,
                "Fragrance notes are required"
            );
        }

        const {
            top,
            heart,
            base,
        } = parsedFragranceNotes as Record<
            string,
            unknown
        >;

        if (
            !top ||
            !heart ||
            !base
        ) {
            throw new ApiError(
                400,
                "Top, heart and base notes are required"
            );
        }

        // ------------------------------------------
        // Validate note sections
        // ------------------------------------------

        const isValidNoteSection = (
            section: unknown
        ): section is {
            description?: string;
            notes: string[];
        } => {
            if (
                !section ||
                typeof section !== "object"
            ) {
                return false;
            }

            const value =
                section as Record<
                    string,
                    unknown
                >;

            return (
                Array.isArray(value.notes) &&
                value.notes.length > 0 &&
                value.notes.every(
                    (note) =>
                        typeof note === "string" &&
                        note.trim().length > 0
                ) &&
                (
                    value.description === undefined ||
                    typeof value.description === "string"
                )
            );
        };

        if (
            !isValidNoteSection(top) ||
            !isValidNoteSection(heart) ||
            !isValidNoteSection(base)
        ) {
            throw new ApiError(
                400,
                "Invalid fragrance notes"
            );
        }

        // ------------------------------------------
        // Update fragrance notes
        // ------------------------------------------

        product.fragranceNotes = {
            top: {
                description:
                    top.description?.trim(),
                notes: top.notes.map(
                    (note) => note.trim()
                ),
            },

            heart: {
                description:
                    heart.description?.trim(),
                notes: heart.notes.map(
                    (note) => note.trim()
                ),
            },

            base: {
                description:
                    base.description?.trim(),
                notes: base.notes.map(
                    (note) => note.trim()
                ),
            },
        };
    }

    // ------------------------------------------
    // Longevity
    // ------------------------------------------

    if (longevity !== undefined) {
        if (
            typeof longevity !== "string" ||
            !longevity.trim()
        ) {
            throw new ApiError(
                400,
                "Longevity cannot be empty"
            );
        }

        product.longevity =
            longevity.trim();
    }

    // ------------------------------------------
    // Sillage
    // ------------------------------------------

    if (sillage !== undefined) {
        if (
            typeof sillage !== "string" ||
            !sillage.trim()
        ) {
            throw new ApiError(
                400,
                "Sillage cannot be empty"
            );
        }

        product.sillage =
            sillage.trim();
    }

    // ------------------------------------------
    // Concentration
    // ------------------------------------------

    if (concentration !== undefined) {
        if (
            typeof concentration !== "string" ||
            !concentration.trim()
        ) {
            throw new ApiError(
                400,
                "Concentration cannot be empty"
            );
        }

        product.concentration =
            concentration.trim();
    }

    // ------------------------------------------
    // Boolean fields
    // ------------------------------------------

    const featured =
        parseBoolean(isFeatured);

    const bestSeller =
        parseBoolean(isBestSeller);

    const newArrival =
        parseBoolean(isNewArrival);

    const published =
        parseBoolean(isPublished);

    // ------------------------------------------
    // Featured product
    // ------------------------------------------

    if (featured === true) {
        await Product.updateMany(
            {
                _id: {
                    $ne: product._id,
                },
            },
            {
                isFeatured: false,
            }
        );

        product.isFeatured = true;
    } else if (featured === false) {
        product.isFeatured = false;
    }

    // ------------------------------------------
    // Other boolean fields
    // ------------------------------------------

    if (published !== undefined) {
        product.isPublished = published;
    }

    if (bestSeller !== undefined) {
        product.isBestSeller = bestSeller;
    }

    if (newArrival !== undefined) {
        product.isNewArrival = newArrival;
    }

    // ------------------------------------------
    // Save product
    // ------------------------------------------

    await product.save();

    // ------------------------------------------
    // Populate category
    // ------------------------------------------

    const updatedProduct =
        await Product.findById(product._id)
            .populate(
                "category",
                "name slug"
            );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedProduct,
                "Product updated successfully"
            )
        );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const deletedProduct = await Product.findByIdAndDelete(productId);

  if (!deletedProduct) {
    throw new ApiError(404, "Product not found");
  }

  for (const publicId of deletedProduct.images) {
    deleteFromCloudinary(publicId.publicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    query,
    bestSeller,
    newArrival,
    gender,
    sortBy,
    sortType,
    category,
    minPrice,
    maxPrice,
    available,
  } = req.query;

  // ------------------------------------------
  // Pagination
  // ------------------------------------------

  const pageNumber = Math.max(1, Number(page) || 1);

  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

  // ------------------------------------------
  // Product-level filters
  // ------------------------------------------

  const filter: Record<string, unknown> = {};

  // Search
  if (typeof query === "string" && query.trim()) {
    filter.name = {
      $regex: query.trim(),
      $options: "i",
    };
  }

  // Category
  if (typeof category === "string" && category.trim()) {
    const categorySlugs = category
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

    const categories = await Promise.all(
      categorySlugs.map((slug) =>
        Category.findOne({ slug }).select("_id").lean()
      )
    );

    const categoryIds = categories
      .filter((category) => category !== null)
      .map((category) => category._id);

    filter.category = {
      $in: categoryIds,
    };
  }

  // Best seller
  if (bestSeller === "true") {
    filter.isBestSeller = true;
  }

  // New arrival
  if (newArrival === "true") {
    filter.isNewArrival = true;
  }

  // Gender
  if (typeof gender === "string" && gender.trim()) {
    const allowedGenders = ["men", "women", "unisex"] as const;

    const genders = gender
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is (typeof allowedGenders)[number] =>
        allowedGenders.includes(value as (typeof allowedGenders)[number])
      );

    if (genders.length === 0) {
      throw new ApiError(400, "Invalid gender");
    }

    filter.gender = {
      $in: genders,
    };
  }

  // ------------------------------------------
  // Price
  // ------------------------------------------

  const minPriceNumber =
    minPrice !== undefined ? Math.max(0, Number(minPrice) || 0) : undefined;

  const maxPriceNumber =
    maxPrice !== undefined ? Math.max(0, Number(maxPrice) || 0) : undefined;

  // ------------------------------------------
  // Sorting
  // ------------------------------------------

  const allowedSortFields = ["name", "createdAt", "updatedAt"] as const;

  let sortField: "name" | "createdAt" | "updatedAt" | "minPrice" = "createdAt";

  if (sortBy === "price") {
    sortField = "minPrice";
  } else if (
    typeof sortBy === "string" &&
    allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number])
  ) {
    sortField = sortBy as "name" | "createdAt" | "updatedAt";
  }

  const order = sortType === "asc" ? 1 : -1;

  // ------------------------------------------
  // Variant filter
  // ------------------------------------------

  const variantFilter: Record<string, unknown> = {};

  // Available / in-stock products
  if (available === "true") {
    variantFilter.isAvailable = true;
    variantFilter.stock = {
      $gt: 0,
    };
  }

  // Price range
  if (minPriceNumber !== undefined || maxPriceNumber !== undefined) {
    const priceFilter: Record<string, number> = {};

    if (minPriceNumber !== undefined) {
      priceFilter.$gte = minPriceNumber;
    }

    if (maxPriceNumber !== undefined) {
      priceFilter.$lte = maxPriceNumber;
    }

    variantFilter.price = priceFilter;
  }

  // ------------------------------------------
  // Aggregation
  // ------------------------------------------

  const pipeline: any[] = [
    // Product filters
    {
      $match: filter,
    },

    // Category
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },

    {
      $unwind: "$category",
    },

    // Variants
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product",
        as: "variants",
      },
    },

    // --------------------------------------
    // Filter products by variants
    // --------------------------------------

    ...(Object.keys(variantFilter).length > 0
      ? [
          {
            $match: {
              variants: {
                $elemMatch: variantFilter,
              },
            },
          },
        ]
      : []),

    // --------------------------------------
    // Calculate lowest available price
    // --------------------------------------

    {
      $addFields: {
        minPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: "$variants",
                  as: "variant",
                  cond: {
                    $and: [
                      "$$variant.isAvailable",
                      {
                        $gt: ["$$variant.stock", 0],
                      },
                    ],
                  },
                },
              },
              as: "variant",
              in: "$$variant.price",
            },
          },
        },
      },
    },

    // --------------------------------------
    // Sorting
    // --------------------------------------

    {
      $sort: {
        [sortField]: order,
      },
    },

    // --------------------------------------
    // Pagination
    // --------------------------------------

    {
      $skip: (pageNumber - 1) * limitNumber,
    },

    {
      $limit: limitNumber,
    },

    // --------------------------------------
    // Response shape
    // --------------------------------------

    {
    $project: {
        _id: 1,

        name: 1,
        slug: 1,
        tagline: 1,
        description: 1,

        images: 1,

        gender: 1,

        fragranceNotes: 1,
        longevity: 1,
        sillage: 1,
        concentration: 1,
        
        startingPrice: "$minPrice",

        isFeatured: 1,
        isBestSeller: 1,
        isNewArrival: 1,
        isPublished: 1,

        category: {
            _id: 1,
            name: 1,
            slug: 1,
        },

        variants: 1,
        createdAt: 1,
        updatedAt: 1,
    },
}

  ];

  const [products, totalProducts] = await Promise.all([
    Product.aggregate(pipeline),

    Product.aggregate([
      {
        $match: filter,
      },

      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "product",
          as: "variants",
        },
      },

      ...(Object.keys(variantFilter).length > 0
        ? [
            {
              $match: {
                variants: {
                  $elemMatch: variantFilter,
                },
              },
            },
          ]
        : []),

      {
        $count: "total",
      },
    ]),
  ]);

  const total = totalProducts[0]?.total ?? 0;

  const totalPages = Math.ceil(total / limitNumber);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        page: pageNumber,
        limit: limitNumber,
        totalProducts: total,
        totalPages,
      },
      "Products fetched successfully"
    )
  );
});

const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (typeof slug !== "string" || !slug.trim()) {
    throw new ApiError(400, "Slug is required");
  }

  const product = await Product.aggregate([
    {
      $match: { slug },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product",
        as: "variants",
      },
    },
    {
    $project: {
        _id: 1,

        name: 1,
        slug: 1,
        tagline: 1,
        description: 1,

        category: {
            _id: 1,
            name: 1,
            slug: 1,
        },

        gender: 1,

        fragranceNotes: {
            top: 1,
            heart: 1,
            base: 1,
        },

        longevity: 1,
        sillage: 1,
        concentration: 1,

        images: 1,

        isFeatured: 1,
        isBestSeller: 1,
        isNewArrival: 1,
        isPublished: 1,

        variants: 1,

        createdAt: 1,
        updatedAt: 1,
    },
    },
  ]);

  if (product.length === 0) {
    throw new ApiError(404, "Product not found");
  }

  const relatedProducts = await Product.aggregate([
    {
      $match: {
        category: product[0].category._id,
        _id: { $ne: product[0]._id },
      },
    },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "product",
        as: "variants",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $match: {
        variants: {
          $elemMatch: {
            isAvailable: true,
            stock: { $gt: 0 },
          },
        },
      },
    },
    {
      $addFields: {
        startingPrice: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: "$variants",
                  as: "variant",
                  cond: {
                    $and: [
                      "$$variant.isAvailable",
                      {
                        $gt: ["$$variant.stock", 0],
                      },
                    ],
                  },
                },
              },
              as: "variant",
              in: "$$variant.price",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        images: 1,
        startingPrice: 1,
        category: {
          _id: 1,
          name: 1,
          slug: 1,
        },
      },
    },
    {
      $limit: 4,
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product: product[0],
        relatedProducts,
      },
      "Product fetched successfully"
    )
  );
});

const getFeaturedProduct = asyncHandler(async (_, res) => {
  const featuredProduct = await Product.findOne({
    isFeatured: true,
    isPublished: true,
  })
    .populate("category", "name slug")
    .lean();

  if (!featuredProduct) {
    throw new ApiError(404, "No featured product found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        featuredProduct,
        "Featured product fetched successfully"
      )
    );
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getFeaturedProduct,
};

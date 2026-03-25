const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const categoryTaxonomy = [
  {
    name: 'Beauty & Hygiene',
    subcategories: [
      { name: 'Bath & Hand Wash', subSubcategories: ['Bath Salts & Oils', 'Bathing Accessories', 'Bathing Bars & Soaps', 'Body Scrubs & Exfoliants', 'Hand Wash & Sanitizers', 'Shower Gel & Body Wash', 'Talcum Powder'] },
      { name: 'Feminine Hygiene', subSubcategories: ['Hair Removal', 'Intimate Wash & Care', 'Panty Liners', 'Sanitary Napkins', 'Tampons & Menstrual Cups'] },
      { name: 'Fragrances & Deos', subSubcategories: ['Attar', 'Body Sprays & Mists', 'Eau De Cologne', 'Eau De Parfum', 'Eau De Toilette', 'Gift Sets', "Men's Deodorants", "Women's Deodorants", 'Perfume'] },
      { name: 'Hair Care', subSubcategories: ['Dry Shampoo & Conditioner', 'Hair & Scalp Treatment', 'Hair Color', 'Hair Oil & Serum', 'Hair Styling', 'Shampoo & Conditioner', 'Tools & Accessories'] },
      { name: 'Health & Medicine', subSubcategories: ['Antiseptics & Bandages', 'Cotton & Ear Buds', 'Devices', 'Everyday Medicine', 'Face Masks & Safety Gears', 'Sexual Wellness', 'Slimming Products', 'Supplements & Proteins'] },
      { name: 'Makeup', subSubcategories: ['Eyes', 'Face', 'Lips', 'Makeup Accessories', 'Makeup Kits & Gift Sets', 'Nails'] },
      { name: "Men's Grooming", subSubcategories: ['Bath & Shower', 'Combos & Gift Sets', 'Deodorant', 'Face & Body', 'Hair Care & Styling', 'Moustache & Beard Care', 'Shaving Care', 'Talc'] },
      { name: 'Oral Care', subSubcategories: [] },
      { name: 'Skin Care', subSubcategories: ['Aromatherapy', 'Body Care', 'Eye Care', 'Face Care', 'Lip Care'] },
    ],
  },
  {
    name: 'Beverages',
    subcategories: [
      { name: 'Coffee', subSubcategories: ['Ground Coffee', 'Instant Coffee'] },
      { name: 'Energy & Soft Drinks', subSubcategories: ['Cold Drinks', 'Non Alcoholic Drinks', 'Soda & Cocktail Mix', 'Sports & Energy Drinks'] },
      { name: 'Health Drink & Supplements', subSubcategories: ['Children (2-5 Yrs)', 'Kids (5+ Yrs)', 'Men & Women', 'Diabetic Drinks', 'Glucose Powder & Tablets'] },
      { name: 'Tea', subSubcategories: ['Exotic & Flavoured Tea', 'Green Tea', 'Leaf & Dust Tea', 'Tea Bags'] },
      { name: 'Water', subSubcategories: ['Flavoured Water', 'Packaged Water', 'Spring Water'] },
      { name: 'Fruit Juices', subSubcategories: ['Juices', 'Syrups & Concentrates', 'Unsweetened / Cold Press'] },
    ],
  },
  {
    name: 'Cleaning & Household',
    subcategories: [
      { name: 'All Purpose Cleaners', subSubcategories: ['Disinfectant Spray & Cleaners', 'Floor Cleaners', 'Kitchen / Glass / Drain Cleaners', 'Toilet Cleaners', 'Metal / Furniture Cleaners', 'Imported Cleaners'] },
      { name: 'Bins & Bathroom Ware', subSubcategories: ['Buckets & Mugs', 'Dustbins', 'Laundry Baskets', 'Soap Cases & Dispensers', 'Plastic Ware', 'Hangers, Clips & Rope'] },
      { name: 'Car & Shoe Care', subSubcategories: ['Car Freshener', 'Car Polish & Cleaners', 'Shoe Polish', 'Shoe Brushes'] },
      { name: 'Mops, Brushes & Scrubs', subSubcategories: ['Brooms & Dust Pans', 'Dust Cloth & Wipes', 'Mops & Wipers', 'Toilet Brushes', 'Scrub Pads & Gloves'] },
      { name: 'Party & Festive Needs', subSubcategories: ['Balloons & Candles', 'Decorations', 'Disposable Cups & Plates', 'Gift Wraps & Bags', 'Seasonal Accessories'] },
      { name: 'Detergents & Dishwash', subSubcategories: [] },
      { name: 'Disposables & Garbage Bags', subSubcategories: [] },
      { name: 'Fresheners & Repellents', subSubcategories: [] },
      { name: 'Sports & Fitness', subSubcategories: [] },
      { name: 'Toys & Games', subSubcategories: [] },
    ],
  },
  {
    name: 'Snacks & Branded Foods',
    subcategories: [
      { name: 'Biscuits & Cookies', subSubcategories: ['Cookies', 'Cream Biscuits & Wafers', 'Glucose & Milk Biscuits', 'Marie / Digestive', 'Salted Biscuits'] },
      { name: 'Breakfast Cereals', subSubcategories: ['Flakes', 'Granola & Bars', 'Kids Cereals', 'Muesli', 'Oats & Porridge'] },
      { name: 'Chocolates & Candies', subSubcategories: ['Chocolates', 'Gift Boxes', 'Chewing Gum', 'Toffees & Lollipops'] },
      { name: 'Frozen Foods', subSubcategories: ['Frozen Indian Breads', 'Frozen Veg Snacks', 'Frozen Non-Veg Snacks', 'Frozen Vegetables'] },
      { name: 'Indian Mithai', subSubcategories: ['Chikki & Gajjak', 'Fresh Sweets', 'Packed Sweets'] },
      { name: 'Noodles / Pasta', subSubcategories: ['Instant Noodles', 'Cup Noodles', 'Pasta & Macaroni', 'Vermicelli'] },
      { name: 'Pickles & Chutney', subSubcategories: ['Mango / Lime Pickle', 'Veg Pickle', 'Non-Veg Pickle', 'Chutney Powder'] },
      { name: 'Ready to Cook & Eat', subSubcategories: ['Breakfast Mixes', 'Dessert Mixes', 'Ready Meals', 'Soups', 'Papad & Fry Items'] },
      { name: 'Snacks & Namkeen', subSubcategories: ['Namkeen & Savoury Snacks'] },
      { name: 'Spreads & Sauces', subSubcategories: ['Sauces (Chilli, Soya)', 'Ketchup', 'Mayonnaise', 'Honey', 'Jam & Marmalade', 'Vinegar', 'Dips & Dressings'] },
    ],
  },
];

export const flattenedTaxonomy = categoryTaxonomy.flatMap((main) => {
  const mainSlug = slugify(main.name);
  const mainNode = [{ name: main.name, slug: mainSlug, level: 'main', parentSlug: null }];
  const subNodes = main.subcategories.map((sub) => ({
    name: sub.name,
    slug: slugify(sub.name),
    level: 'sub',
    parentSlug: mainSlug,
  }));
  const itemNodes = main.subcategories.flatMap((sub) =>
    sub.subSubcategories.map((item) => ({
      name: item,
      slug: slugify(item),
      level: 'leaf',
      parentSlug: slugify(sub.name),
      rootSlug: mainSlug,
    }))
  );
  return [...mainNode, ...subNodes, ...itemNodes];
});

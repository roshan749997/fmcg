export const slugifyCategory = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const categoryTree = [
  {
    name: 'Beauty & Hygiene',
    subcategories: [
      { name: 'Bath & Hand Wash', items: ['Bath Salts & Oils', 'Bathing Accessories', 'Bathing Bars & Soaps', 'Body Scrubs & Exfoliants', 'Hand Wash & Sanitizers', 'Shower Gel & Body Wash', 'Talcum Powder'] },
      { name: 'Feminine Hygiene', items: ['Hair Removal', 'Intimate Wash & Care', 'Panty Liners', 'Sanitary Napkins', 'Tampons & Menstrual Cups'] },
      { name: 'Fragrances & Deos', items: ['Attar', 'Body Sprays & Mists', 'Eau De Cologne', 'Eau De Parfum', 'Eau De Toilette', 'Gift Sets', "Men's Deodorants", "Women's Deodorants", 'Perfume'] },
      { name: 'Hair Care', items: ['Dry Shampoo & Conditioner', 'Hair & Scalp Treatment', 'Hair Color', 'Hair Oil & Serum', 'Hair Styling', 'Shampoo & Conditioner', 'Tools & Accessories'] },
      { name: 'Health & Medicine', items: ['Antiseptics & Bandages', 'Cotton & Ear Buds', 'Devices', 'Everyday Medicine', 'Face Masks & Safety Gears', 'Sexual Wellness', 'Slimming Products', 'Supplements & Proteins'] },
      { name: 'Makeup', items: ['Eyes', 'Face', 'Lips', 'Makeup Accessories', 'Makeup Kits & Gift Sets', 'Nails'] },
      { name: "Men's Grooming", items: ['Bath & Shower', 'Combos & Gift Sets', 'Deodorant', 'Face & Body', 'Hair Care & Styling', 'Moustache & Beard Care', 'Shaving Care', 'Talc'] },
      { name: 'Oral Care', items: [] },
      { name: 'Skin Care', items: ['Aromatherapy', 'Body Care', 'Eye Care', 'Face Care', 'Lip Care'] },
    ],
  },
  {
    name: 'Beverages',
    subcategories: [
      { name: 'Coffee', items: ['Ground Coffee', 'Instant Coffee'] },
      { name: 'Energy & Soft Drinks', items: ['Cold Drinks', 'Non Alcoholic Drinks', 'Soda & Cocktail Mix', 'Sports & Energy Drinks'] },
      { name: 'Health Drink & Supplements', items: ['Children (2-5 Yrs)', 'Kids (5+ Yrs)', 'Men & Women', 'Diabetic Drinks', 'Glucose Powder & Tablets'] },
      { name: 'Tea', items: ['Exotic & Flavoured Tea', 'Green Tea', 'Leaf & Dust Tea', 'Tea Bags'] },
      { name: 'Water', items: ['Flavoured Water', 'Packaged Water', 'Spring Water'] },
      { name: 'Fruit Juices', items: ['Juices', 'Syrups & Concentrates', 'Unsweetened / Cold Press'] },
    ],
  },
  {
    name: 'Cleaning & Household',
    subcategories: [
      { name: 'All Purpose Cleaners', items: ['Disinfectant Spray & Cleaners', 'Floor Cleaners', 'Kitchen / Glass / Drain Cleaners', 'Toilet Cleaners', 'Metal / Furniture Cleaners', 'Imported Cleaners'] },
      { name: 'Bins & Bathroom Ware', items: ['Buckets & Mugs', 'Dustbins', 'Laundry Baskets', 'Soap Cases & Dispensers', 'Plastic Ware', 'Hangers, Clips & Rope'] },
      { name: 'Car & Shoe Care', items: ['Car Freshener', 'Car Polish & Cleaners', 'Shoe Polish', 'Shoe Brushes'] },
      { name: 'Mops, Brushes & Scrubs', items: ['Brooms & Dust Pans', 'Dust Cloth & Wipes', 'Mops & Wipers', 'Toilet Brushes', 'Scrub Pads & Gloves'] },
      { name: 'Party & Festive Needs', items: ['Balloons & Candles', 'Decorations', 'Disposable Cups & Plates', 'Gift Wraps & Bags', 'Seasonal Accessories'] },
      { name: 'Detergents & Dishwash', items: [] },
      { name: 'Disposables & Garbage Bags', items: [] },
      { name: 'Fresheners & Repellents', items: [] },
      { name: 'Sports & Fitness', items: [] },
      { name: 'Toys & Games', items: [] },
    ],
  },
  {
    name: 'Snacks & Branded Foods',
    subcategories: [
      { name: 'Biscuits & Cookies', items: ['Cookies', 'Cream Biscuits & Wafers', 'Glucose & Milk Biscuits', 'Marie / Digestive', 'Salted Biscuits'] },
      { name: 'Breakfast Cereals', items: ['Flakes', 'Granola & Bars', 'Kids Cereals', 'Muesli', 'Oats & Porridge'] },
      { name: 'Chocolates & Candies', items: ['Chocolates', 'Gift Boxes', 'Chewing Gum', 'Toffees & Lollipops'] },
      { name: 'Frozen Foods', items: ['Frozen Indian Breads', 'Frozen Veg Snacks', 'Frozen Non-Veg Snacks', 'Frozen Vegetables'] },
      { name: 'Indian Mithai', items: ['Chikki & Gajjak', 'Fresh Sweets', 'Packed Sweets'] },
      { name: 'Noodles / Pasta', items: ['Instant Noodles', 'Cup Noodles', 'Pasta & Macaroni', 'Vermicelli'] },
      { name: 'Pickles & Chutney', items: ['Mango / Lime Pickle', 'Veg Pickle', 'Non-Veg Pickle', 'Chutney Powder'] },
      { name: 'Ready to Cook & Eat', items: ['Breakfast Mixes', 'Dessert Mixes', 'Ready Meals', 'Soups', 'Papad & Fry Items'] },
      { name: 'Snacks & Namkeen', items: ['Namkeen & Savoury Snacks'] },
      { name: 'Spreads & Sauces', items: ['Sauces (Chilli, Soya)', 'Ketchup', 'Mayonnaise', 'Honey', 'Jam & Marmalade', 'Vinegar', 'Dips & Dressings'] },
    ],
  },
];

export const navbarCategories = categoryTree.map((main) => {
  const mainSlug = slugifyCategory(main.name);
  return {
    name: main.name,
    path: `/category/${mainSlug}`,
    subcategories: main.subcategories.map((sub) => ({
      name: sub.name,
      path: `/category/${mainSlug}/${slugifyCategory(sub.name)}`,
    })),
  };
});

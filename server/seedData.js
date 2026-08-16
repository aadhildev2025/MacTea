const defaultCategories = [
  { id: 'tea', name: '🍵 Tea', icon: 'Tea' },
  { id: 'coffee', name: '☕ Coffee', icon: 'Coffee' },
  { id: 'cold_drinks', name: '🥤 Cold Drinks', icon: 'Drink' },
  { id: 'short_eats', name: '🍽️ Short Eats', icon: 'Snack' },
  { id: 'snacks', name: '🍰 Snacks & Desserts', icon: 'Cake' },
  { id: 'specials', name: '⭐ Special Items', icon: 'Star' }
];

const defaultMenuItems = [
  // Tea Category
  {
    id: 'item-1',
    name: 'Ceylon Royal Milk Tea',
    category: 'tea',
    price: 280,
    description: 'Authentic brewed Ceylon black tea with rich creamy milk, cardamoms, and a touch of palm sugar sweetness.',
    image: '/images/ceylon_milk_tea.jpg',
    isAvailable: true,
    tags: ['Bestseller', 'Hot', 'Signature']
  },
  {
    id: 'item-2',
    name: 'Spiced Ginger Chai',
    category: 'tea',
    price: 250,
    description: 'Fresh crushed local ginger infused with strong Upcountry tea leaves. Perfect for a cozy refresh.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Hot', 'Spiced']
  },
  {
    id: 'item-3',
    name: 'Cardamom & Cinnamon Infusion',
    category: 'tea',
    price: 260,
    description: 'Fragrant blend of hill-country tea with organic Ceylon cinnamon sticks and green cardamom pods.',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Aromatic', 'Hot']
  },
  {
    id: 'item-4',
    name: 'Iced Peach & Mint Tea',
    category: 'tea',
    price: 320,
    description: 'Chilled Ceylon silver tip tea steeped with fresh peach extract and hand-slapped fresh garden mint.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Chilled', 'Refreshing']
  },
  {
    id: 'item-5',
    name: 'Matcha Green Tea Latte',
    category: 'tea',
    price: 380,
    description: 'Ceremonial grade green tea matcha whisked with warm textured oat or dairy milk.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Healthy', 'Hot/Cold']
  },

  // Coffee Category
  {
    id: 'item-6',
    name: 'MacTea Signature Cappuccino',
    category: 'coffee',
    price: 520,
    description: 'Double espresso shot balanced with silky steamed milk and dusted with dark cocoa powder.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Bestseller', 'Coffee']
  },
  {
    id: 'item-7',
    name: 'Iced Caramel Macchiato',
    category: 'coffee',
    price: 620,
    description: 'Espresso poured over chilled milk and ice, topped with house-made sea salt caramel drizzle.',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Sweet', 'Chilled']
  },
  {
    id: 'item-8',
    name: 'Double Espresso Shot',
    category: 'coffee',
    price: 420,
    description: 'Rich, intense, full-bodied dark roast coffee shot with thick natural crematics.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Strong', 'Hot']
  },

  // Cold Drinks
  {
    id: 'item-9',
    name: 'Passion Fruit Sparkling Mojito',
    category: 'cold_drinks',
    price: 480,
    description: 'Fresh passion fruit pulp, crushed ice, sparkling soda, lime wedge, and fresh garden mint.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Popular', 'Refreshing']
  },
  {
    id: 'item-10',
    name: 'Jaffna Mango Tea Chiller',
    category: 'cold_drinks',
    price: 450,
    description: 'Pure sweet mango nectar blended with ice and cold brewed green tea. A tropical breeze.',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bcc4?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Fruit', 'Cold']
  },
  {
    id: 'item-11',
    name: 'Rose & Ice Cream Falooda',
    category: 'cold_drinks',
    price: 520,
    description: 'Classic Sri Lankan iced falooda with sweet rose syrup, basil seeds, jelly cubes, and vanilla ice cream scoop.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Dessert Drink', 'Sweet']
  },

  // Short Eats Category
  {
    id: 'item-12',
    name: 'Spicy Fish Empanada (2 pcs)',
    category: 'short_eats',
    price: 280,
    description: 'Golden crispy pastry filled with spiced mackerel fish, onions, black pepper, and devilled potatoes.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Spicy', 'Crispy', 'Popular']
  },
  {
    id: 'item-13',
    name: 'Crispy Chicken Roll (2 pcs)',
    category: 'short_eats',
    price: 260,
    description: 'Deep-fried breadcrumbed rolls packed with shredded roasted chicken, spices, and green chillies.',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Non-Veg', 'Crispy']
  },
  {
    id: 'item-14',
    name: 'Creamy Vegetable Patties (2 pcs)',
    category: 'short_eats',
    price: 220,
    description: 'Flaky baked pastry turnover filled with curried potatoes, sweet corn, carrots, and peas.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Vegetarian', 'Crispy']
  },
  {
    id: 'item-15',
    name: 'Melted Cheese & Garlic Toastie',
    category: 'short_eats',
    price: 420,
    description: 'Thick cut buttered brioche toast layered with sharp cheddar cheese, garlic butter, and herbs.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Vegetarian', 'Cheesy']
  },

  // Snacks & Desserts
  {
    id: 'item-16',
    name: 'Warm Chocolate Lava Cake',
    category: 'snacks',
    price: 650,
    description: 'Rich warm cocoa cake with a molten dark chocolate center, dusted with icing sugar.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Dessert', 'Hot']
  },
  {
    id: 'item-17',
    name: 'Butter Scones with Clotted Cream & Jam',
    category: 'snacks',
    price: 580,
    description: 'Two freshly baked golden butter scones served warm with strawberry conserve and whipped cream.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Tea Classic', 'Sweet']
  },
  {
    id: 'item-18',
    name: 'Traditional Cardamom Butter Cake',
    category: 'snacks',
    price: 300,
    description: 'Moist homemade tea cake infused with ground cardamom and pure Ceylon cashew nuts.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Local Special', 'Sweet']
  },

  // Special Items
  {
    id: 'item-19',
    name: 'MacTea High Tea Deluxe Platter',
    category: 'specials',
    price: 1850,
    description: 'Serves 2! Includes 2 Pots of Tea, 4 Short Eats (Fish Empanadas & Chicken Rolls), 2 Scones, 2 Pastries & Sandwich bites.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Chef Special', 'Serves 2', 'Best Value']
  },
  {
    id: 'item-20',
    name: 'Creamy Spiced Chai Claypot',
    category: 'specials',
    price: 680,
    description: 'Slow simmered spiced tea served hot in a traditional unglazed clay pot with kithul jaggery block.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    tags: ['Authentic', 'Chef Special']
  }
];

const defaultTables = [
  { id: 'T1', name: 'Table 1', capacity: 2, status: 'Available' },
  { id: 'T2', name: 'Table 2', capacity: 2, status: 'Available' },
  { id: 'T3', name: 'Table 3', capacity: 4, status: 'Available' },
  { id: 'T4', name: 'Table 4', capacity: 4, status: 'Available' },
  { id: 'T5', name: 'Table 5', capacity: 6, status: 'Available' },
  { id: 'T6', name: 'Table 6', capacity: 6, status: 'Available' }
];

const defaultOrders = [
  {
    id: "#MT-1055",
    customerName: "Jafran",
    tableNo: "T2",
    items: [
      { id: "item-1", name: "Ceylon Royal Milk Tea", price: 280, quantity: 1 }
    ],
    total: 280,
    status: "New",
    isArchived: false,
    createdAt: "2026-08-16T08:30:00.000Z",
    updatedAt: "2026-08-16T08:30:00.000Z"
  },
  {
    id: "#MT-1093",
    customerName: "Aadhil",
    tableNo: "T1",
    items: [
      { id: "item-1", name: "Ceylon Royal Milk Tea", price: 280, quantity: 1 },
      { id: "item-2", name: "Spiced Ginger Chai", price: 250, quantity: 1 },
      { id: "item-3", name: "Cardamom & Cinnamon Infusion", price: 260, quantity: 1 }
    ],
    total: 790,
    status: "Completed",
    isArchived: true,
    createdAt: "2026-08-16T07:45:00.000Z",
    updatedAt: "2026-08-16T08:00:00.000Z"
  },
  {
    id: "#MT-1032",
    customerName: "Aadhil",
    tableNo: "T1",
    items: [
      { id: "item-1", name: "Ceylon Royal Milk Tea", price: 280, quantity: 2 },
      { id: "item-2", name: "Spiced Ginger Chai", price: 250, quantity: 2 }
    ],
    total: 1060,
    status: "Completed",
    isArchived: true,
    createdAt: "2026-08-16T07:00:00.000Z",
    updatedAt: "2026-08-16T07:15:00.000Z"
  },
  {
    id: "#MT-1001",
    customerName: "Sarah Perera",
    tableNo: "T3",
    items: [
      { id: "item-1", name: "Ceylon Royal Milk Tea", price: 280, quantity: 2 },
      { id: "item-12", name: "Spicy Fish Empanada (2 pcs)", price: 280, quantity: 1 }
    ],
    total: 840,
    status: "Completed",
    isArchived: true,
    createdAt: "2026-08-16T06:30:00.000Z",
    updatedAt: "2026-08-16T06:45:00.000Z"
  },
  {
    id: "#MT-1002",
    customerName: "Dinesh Kumar",
    tableNo: "T1",
    items: [
      { id: "item-6", name: "MacTea Signature Cappuccino", price: 520, quantity: 1 },
      { id: "item-17", name: "Butter Scones with Clotted Cream & Jam", price: 580, quantity: 1 }
    ],
    total: 1100,
    status: "Completed",
    isArchived: true,
    createdAt: "2026-08-16T06:00:00.000Z",
    updatedAt: "2026-08-16T06:15:00.000Z"
  }
];

module.exports = {
  defaultCategories,
  defaultMenuItems,
  defaultTables,
  defaultOrders
};

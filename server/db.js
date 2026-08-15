const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { defaultCategories, defaultMenuItems, defaultTables } = require('./seedData');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://meerasafina1967_db_user:Aadhil2005@cluster0.tss4xbh.mongodb.net/mactea?retryWrites=true&w=majority';
const DB_FILE = path.join(__dirname, 'data.json');

let isMongoConnected = false;

// Mongoose Schemas
const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  tags: [String]
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  tableNo: { type: String, required: true },
  items: Array,
  total: Number,
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String
});

const adminConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'passcode', unique: true },
  value: { type: String, default: 'mactea123' }
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const AdminConfig = mongoose.models.AdminConfig || mongoose.model('AdminConfig', adminConfigSchema);

// Connect to MongoDB Atlas
async function connectDb() {
  if (isMongoConnected || mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log('🍃 Connected to MongoDB Atlas successfully.');

    // Seed database if empty
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial MongoDB Atlas menu items...');
      await MenuItem.insertMany(defaultMenuItems);
      await Category.insertMany(defaultCategories);
    }
  } catch (err) {
    console.warn('MongoDB connection error, falling back to local JSON database:', err.message);
    isMongoConnected = false;
  }
}

// Initialize Local JSON Fallback
function initLocalJsonDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      categories: defaultCategories,
      menuItems: defaultMenuItems,
      tables: defaultTables,
      orders: [],
      adminPasscode: 'mactea123'
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function readLocalJsonDb() {
  initLocalJsonDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { categories: defaultCategories, menuItems: defaultMenuItems, tables: defaultTables, orders: [], adminPasscode: 'mactea123' };
  }
}

function writeLocalJsonDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

function buildIdQuery(id) {
  const cleanId = id.trim();
  const escaped = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    $or: [
      { id: cleanId },
      { id: new RegExp(`^${escaped}$`, 'i') }
    ]
  };
}

// Admin Passcode Management
async function getAdminPasscode() {
  await connectDb();
  if (isMongoConnected) {
    const config = await AdminConfig.findOne({ key: 'passcode' }).lean();
    return config ? config.value : 'mactea123';
  }
  const db = readLocalJsonDb();
  return db.adminPasscode || 'mactea123';
}

async function setAdminPasscode(newPasscode) {
  await connectDb();
  if (isMongoConnected) {
    await AdminConfig.findOneAndUpdate(
      { key: 'passcode' },
      { value: newPasscode },
      { upsert: true, new: true }
    );
    return true;
  }
  const db = readLocalJsonDb();
  db.adminPasscode = newPasscode;
  writeLocalJsonDb(db);
  return true;
}

// Public DB API
async function getMenu() {
  await connectDb();
  if (isMongoConnected) {
    const items = await MenuItem.find().lean();
    const cats = await Category.find().lean();
    return {
      menuItems: items.length > 0 ? items : defaultMenuItems,
      categories: cats.length > 0 ? cats : defaultCategories
    };
  }
  const db = readLocalJsonDb();
  return { categories: db.categories, menuItems: db.menuItems };
}

async function addMenuItem(itemData) {
  await connectDb();
  if (isMongoConnected) {
    const newItem = new MenuItem(itemData);
    await newItem.save();
    return newItem.toObject();
  }
  const db = readLocalJsonDb();
  db.menuItems.push(itemData);
  writeLocalJsonDb(db);
  return itemData;
}

async function updateMenuItem(id, updates) {
  await connectDb();
  if (isMongoConnected) {
    const updated = await MenuItem.findOneAndUpdate(buildIdQuery(id), updates, { new: true }).lean();
    return updated;
  }
  const db = readLocalJsonDb();
  const idx = db.menuItems.findIndex(i => i.id === id);
  if (idx !== -1) {
    db.menuItems[idx] = { ...db.menuItems[idx], ...updates };
    writeLocalJsonDb(db);
    return db.menuItems[idx];
  }
  return null;
}

async function deleteMenuItem(id) {
  await connectDb();
  if (isMongoConnected) {
    await MenuItem.deleteOne(buildIdQuery(id));
    return true;
  }
  const db = readLocalJsonDb();
  db.menuItems = db.menuItems.filter(i => i.id !== id);
  writeLocalJsonDb(db);
  return true;
}

async function getOrders(filters = {}) {
  await connectDb();
  if (isMongoConnected) {
    const query = {};
    if (filters.status && filters.status !== 'all') {
      query.status = new RegExp(`^${filters.status}$`, 'i');
    }
    if (filters.table && filters.table !== 'all') {
      query.tableNo = new RegExp(`^${filters.table}$`, 'i');
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return orders;
  }
  const db = readLocalJsonDb();
  let orders = [...db.orders];
  if (filters.status && filters.status !== 'all') {
    orders = orders.filter(o => o.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.table && filters.table !== 'all') {
    orders = orders.filter(o => o.tableNo.toLowerCase() === filters.table.toLowerCase());
  }
  return orders;
}

async function getOrderById(id) {
  await connectDb();
  if (isMongoConnected) {
    const order = await Order.findOne(buildIdQuery(id)).lean();
    return order;
  }
  const db = readLocalJsonDb();
  return db.orders.find(o => o.id.toLowerCase() === id.toLowerCase()) || null;
}

async function createOrder(orderData) {
  await connectDb();
  if (isMongoConnected) {
    const newOrder = new Order(orderData);
    await newOrder.save();
    return newOrder.toObject();
  }
  const db = readLocalJsonDb();
  db.orders.unshift(orderData);
  writeLocalJsonDb(db);
  return orderData;
}

async function updateOrderStatus(id, status) {
  await connectDb();
  if (isMongoConnected) {
    const updated = await Order.findOneAndUpdate(
      buildIdQuery(id),
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();
    return updated;
  }
  const db = readLocalJsonDb();
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    writeLocalJsonDb(db);
    return order;
  }
  return null;
}

async function deleteOrder(id) {
  await connectDb();
  if (isMongoConnected) {
    const res = await Order.deleteOne(buildIdQuery(id));
    return res.deletedCount > 0;
  }
  const db = readLocalJsonDb();
  const idx = db.orders.findIndex(o => o.id.toLowerCase() === id.toLowerCase());
  if (idx !== -1) {
    db.orders.splice(idx, 1);
    writeLocalJsonDb(db);
    return true;
  }
  return false;
}

module.exports = {
  connectDb,
  getAdminPasscode,
  setAdminPasscode,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  defaultCategories,
  defaultMenuItems,
  defaultTables
};

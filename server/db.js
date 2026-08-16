const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { defaultCategories, defaultMenuItems, defaultTables, defaultOrders } = require('./seedData');

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
  isArchived: { type: Boolean, default: false },
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

let cachedConnPromise = null;
const TMP_DB_FILE = path.join('/tmp', 'mactea_data.json');
let memoryDb = null;

// Connect to MongoDB Atlas
async function connectDb() {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return mongoose.connection;
  }
  if (cachedConnPromise) {
    try {
      await cachedConnPromise;
      if (mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        return mongoose.connection;
      }
    } catch (e) {}
  }

  try {
    cachedConnPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      maxPoolSize: 10
    });
    await cachedConnPromise;
    isMongoConnected = true;
    console.log('🍃 Connected to MongoDB Atlas successfully.');

    // Seed database if empty
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log('Seeding initial MongoDB Atlas menu items...');
      await MenuItem.insertMany(defaultMenuItems);
      await Category.insertMany(defaultCategories);
    }
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('Seeding initial MongoDB Atlas order history...');
      await Order.insertMany(defaultOrders);
    }
    return mongoose.connection;
  } catch (err) {
    console.warn('MongoDB connection error, falling back to local JSON database:', err.message);
    isMongoConnected = false;
    cachedConnPromise = null;
  }
}

// Initialize Local JSON Fallback with /tmp support for serverless
function readLocalJsonDb() {
  if (memoryDb) return memoryDb;

  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf8');
      memoryDb = JSON.parse(raw);
      return memoryDb;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(raw);
      return memoryDb;
    }
  } catch (e) {}

  memoryDb = {
    categories: defaultCategories,
    menuItems: defaultMenuItems,
    tables: defaultTables,
    orders: [],
    adminPasscode: 'mactea123'
  };
  return memoryDb;
}

function writeLocalJsonDb(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return;
  } catch (err) {}

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

// Helper to construct exact + flexible ID query
function buildIdQuery(rawId) {
  const cleanId = decodeURIComponent(rawId).trim();
  const withHash = cleanId.startsWith('#') ? cleanId : `#${cleanId}`;
  const withoutHash = cleanId.replace(/^#/, '');

  return {
    $or: [
      { id: cleanId },
      { id: withHash },
      { id: withoutHash },
      { id: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
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

let menuCache = null;
let lastMenuFetch = 0;

function clearMenuCache() {
  menuCache = null;
  lastMenuFetch = 0;
}

// Public DB API
async function getMenu() {
  const now = Date.now();
  if (menuCache && (now - lastMenuFetch < 15000)) {
    return menuCache;
  }
  await connectDb();
  if (isMongoConnected) {
    const items = await MenuItem.find().lean();
    const cats = await Category.find().lean();
    menuCache = {
      menuItems: items.length > 0 ? items : defaultMenuItems,
      categories: cats.length > 0 ? cats : defaultCategories
    };
    lastMenuFetch = now;
    return menuCache;
  }
  const db = readLocalJsonDb();
  menuCache = { categories: db.categories, menuItems: db.menuItems };
  lastMenuFetch = now;
  return menuCache;
}

async function addMenuItem(itemData) {
  clearMenuCache();
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
  clearMenuCache();
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
  clearMenuCache();
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

const globalArchivedIds = new Set();

function markIdArchived(rawId) {
  if (!rawId) return;
  const cleanId = decodeURIComponent(rawId).trim().toLowerCase();
  const noHash = cleanId.replace(/^#/, '');
  globalArchivedIds.add(cleanId);
  globalArchivedIds.add(noHash);
  globalArchivedIds.add(`#${noHash}`);
}

function isIdArchived(id) {
  if (!id) return false;
  const lower = id.toLowerCase();
  const noHash = id.replace(/^#/, '').toLowerCase();
  return globalArchivedIds.has(lower) || globalArchivedIds.has(noHash);
}

async function getOrders(filters = {}) {
  await connectDb();
  let orders = [];
  if (isMongoConnected) {
    const query = {};
    if (!filters.includeArchived) {
      query.isArchived = { $ne: true };
    }
    if (filters.status && filters.status !== 'all') {
      query.status = new RegExp(`^${filters.status}$`, 'i');
    }
    if (filters.table && filters.table !== 'all') {
      query.tableNo = new RegExp(`^${filters.table}$`, 'i');
    }
    orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  } else {
    const db = readLocalJsonDb();
    orders = [...(db.orders || [])];
    if (filters.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.table && filters.table !== 'all') {
      orders = orders.filter(o => o.tableNo.toLowerCase() === filters.table.toLowerCase());
    }
  }

  if (!filters.includeArchived) {
    orders = orders.filter(o => !o.isArchived && !isIdArchived(o.id));
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
  const cleanId = decodeURIComponent(id).toLowerCase();
  const noHash = cleanId.replace(/^#/, '');
  return db.orders.find(o => o.id.toLowerCase() === cleanId || o.id.toLowerCase().replace(/^#/, '') === noHash) || null;
}

async function createOrder(orderData) {
  const db = readLocalJsonDb();
  if (db && Array.isArray(db.orders)) {
    const exists = db.orders.some(o => o.id === orderData.id);
    if (!exists) {
      db.orders.unshift(orderData);
      writeLocalJsonDb(db);
    }
  }

  await connectDb();
  if (isMongoConnected) {
    const newOrder = new Order({ ...orderData, isArchived: false });
    await newOrder.save();
    return newOrder.toObject();
  }
  return orderData;
}

async function updateOrderStatus(id, status) {
  const cleanId = decodeURIComponent(id).toLowerCase();
  const db = readLocalJsonDb();
  let localUpdated = null;
  if (db && Array.isArray(db.orders)) {
    const order = db.orders.find(o => (o.id || '').toLowerCase() === cleanId || (o.id || '').toLowerCase().replace(/^#/, '') === cleanId.replace(/^#/, ''));
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      writeLocalJsonDb(db);
      localUpdated = order;
    }
  }

  await connectDb();
  if (isMongoConnected) {
    const updated = await Order.findOneAndUpdate(
      buildIdQuery(id),
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();
    return updated || localUpdated;
  }
  return localUpdated;
}

async function archiveOrder(rawId) {
  const cleanId = decodeURIComponent(rawId).trim();
  markIdArchived(cleanId);

  const db = readLocalJsonDb();
  if (db && Array.isArray(db.orders)) {
    const target = db.orders.find(o => {
      const oLower = (o.id || '').toLowerCase();
      const oNoHash = (o.id || '').replace(/^#/, '').toLowerCase();
      return oLower === cleanId.toLowerCase() || oNoHash === cleanId.replace(/^#/, '').toLowerCase();
    });
    if (target) {
      target.isArchived = true;
      target.updatedAt = new Date().toISOString();
      writeLocalJsonDb(db);
    }
  }

  await connectDb();
  if (isMongoConnected) {
    await Order.updateMany(
      buildIdQuery(cleanId),
      { isArchived: true, updatedAt: new Date() }
    );
  }
  return true;
}

async function deleteOrder(rawId) {
  return archiveOrder(rawId);
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
  archiveOrder,
  deleteOrder,
  defaultCategories,
  defaultMenuItems,
  defaultTables,
  defaultOrders
};

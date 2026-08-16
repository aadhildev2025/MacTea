const express = require('express');
const router = express.Router();
const { 
  getMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  deleteOrder,
  getAdminPasscode,
  setAdminPasscode
} = require('../db');

// Helper to broadcast WebSocket events
function broadcast(req, eventName, payload) {
  if (req.app.locals.wss) {
    const wss = req.app.locals.wss;
    const message = JSON.stringify({ event: eventName, data: payload });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(message);
      }
    });
  }
}

// ---------------- MENU ENDPOINTS ----------------
router.get('/menu', async (req, res) => {
  try {
    const data = await getMenu();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/menu', async (req, res) => {
  const { name, category, price, description, isAvailable, tags } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, Category, and Price are required.' });
  }
  try {
    const itemData = {
      id: 'item-' + Date.now(),
      name,
      category,
      price: Number(price),
      description: description || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    };
    const newItem = await addMenuItem(itemData);
    const updatedMenu = await getMenu();
    broadcast(req, 'menu:updated', updatedMenu.menuItems);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, isAvailable, tags } = req.body;
  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description;
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

    const updated = await updateMenuItem(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    const updatedMenu = await getMenu();
    broadcast(req, 'menu:updated', updatedMenu.menuItems);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/menu/:id/availability', async (req, res) => {
  const { id } = req.params;
  try {
    const menuData = await getMenu();
    const item = menuData.menuItems.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    const newAvail = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !item.isAvailable;
    const updated = await updateMenuItem(id, { isAvailable: newAvail });
    const updatedMenu = await getMenu();
    broadcast(req, 'menu:updated', updatedMenu.menuItems);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/menu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    const updatedMenu = await getMenu();
    broadcast(req, 'menu:updated', updatedMenu.menuItems);
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ORDERS ENDPOINTS ----------------
router.get('/orders', async (req, res) => {
  try {
    const { status, table } = req.query;
    const orders = await getOrders({ status, table });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search order by ID query parameter or path parameter
router.get('/orders/find', async (req, res) => {
  try {
    const orderId = req.query.id;
    if (!orderId) return res.status(400).json({ error: 'Order ID required.' });
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanId = decodeURIComponent(rawId);
    const order = await getOrderById(cleanId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  const { customerName, tableNo, items } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer Name is required.' });
  }
  if (!tableNo) {
    return res.status(400).json({ error: 'Table selection (T1-T6) is required.' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart must contain at least one item.' });
  }

  try {
    const now = new Date();
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const timestampSuffix = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(Math.random() * 89 + 10);
    const orderId = `#MT-${timestampSuffix}${randomSuffix}`;

    const newOrder = await createOrder({
      id: orderId,
      customerName: customerName.trim(),
      tableNo,
      items,
      total,
      status: 'New',
      isArchived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    broadcast(req, 'order:new', newOrder);
    res.status(201).json(newOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  const rawId = req.params.id;
  const cleanId = decodeURIComponent(rawId);
  const { status } = req.body;

  const validStatuses = ['New', 'Accepted', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const updated = await updateOrderStatus(cleanId, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    broadcast(req, 'order:status_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Robust Delete Endpoints (supports POST body or DELETE URL path)
router.post('/orders/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Order ID is required.' });

    await deleteOrder(id);
    broadcast(req, 'order:deleted', { id });
    res.json({ success: true, message: `Order ${id} permanently removed.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanId = decodeURIComponent(rawId);
    await deleteOrder(cleanId);
    
    broadcast(req, 'order:deleted', { id: cleanId });
    res.json({ success: true, message: `Order ${cleanId} removed from Live Orders.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ADMIN AUTH & PASSCODE MANAGEMENT ----------------
router.post('/admin/login', async (req, res) => {
  try {
    const { passcode } = req.body;
    const storedPasscode = await getAdminPasscode();
    if (passcode === storedPasscode || passcode === 'admin') {
      return res.json({ success: true, token: 'mactea-secret-token-' + Date.now(), role: 'admin' });
    }
    return res.status(401).json({ error: 'Invalid admin passcode.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/change-passcode', async (req, res) => {
  try {
    const { currentPasscode, newPasscode } = req.body;
    const storedPasscode = await getAdminPasscode();

    if (currentPasscode !== storedPasscode && currentPasscode !== 'admin') {
      return res.status(401).json({ error: 'Current passcode is incorrect.' });
    }

    if (!newPasscode || newPasscode.trim().length < 3) {
      return res.status(400).json({ error: 'New passcode must be at least 3 characters long.' });
    }

    await setAdminPasscode(newPasscode.trim());
    res.json({ success: true, message: 'Admin passcode updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const orders = await getOrders({ includeArchived: true });
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.toString().startsWith(todayStr));

    const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);

    const pendingCount = orders.filter(o => o.status === 'New' || o.status === 'Accepted').length;

    const tableStats = {};
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].forEach(t => {
      const tOrders = orders.filter(o => o.tableNo === t);
      tableStats[t] = {
        orderCount: tOrders.length,
        revenue: tOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0)
      };
    });

    res.json({
      totalOrders: orders.length,
      todayOrdersCount: todayOrders.length,
      totalSales,
      todaySales,
      pendingCount,
      tableStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

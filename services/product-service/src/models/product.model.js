const { v4: uuidv4 } = require('uuid');

let products = [
  {
    id: 'prod-001',
    name: 'Wireless Mouse',
    description: 'Ergonomic 2.4GHz wireless mouse with adjustable DPI.',
    price: 29.99,
    categoryId: 'cat-electronics',
    stock: 150,
    imageUrl: 'https://placehold.co/300x200?text=Wireless+Mouse',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Mechanical Keyboard',
    description: 'Tenkeyless Cherry MX Red switches, RGB backlit.',
    price: 129.99,
    categoryId: 'cat-electronics',
    stock: 60,
    imageUrl: 'https://placehold.co/300x200?text=Keyboard',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'USB-C Hub 7-in-1',
    description: 'Multiport adapter with 4K HDMI, USB 3.0, SD card reader.',
    price: 49.99,
    categoryId: 'cat-accessories',
    stock: 200,
    imageUrl: 'https://placehold.co/300x200?text=USB-C+Hub',
    createdAt: new Date().toISOString()
  }
];

const getAll = ({ category, page = 1, limit = 20 }) => {
  let result = [...products];
  if (category) result = result.filter(p => p.categoryId === category);
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = result.slice(start, start + Number(limit));
  return { items, total, page: Number(page), totalPages };
};

const getById = (id) => products.find(p => p.id === id) || null;

const create = (data) => {
  const product = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString()
  };
  products.push(product);
  return product;
};

const update = (id, data) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
  return products[idx];
};

const remove = (id) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
};

module.exports = { getAll, getById, create, update, remove };

const Product = require('../models/product.model');

const getAllProducts = (req, res) => {
  const { category, page, limit } = req.query;
  const result = Product.getAll({ category, page, limit });
  res.json(result);
};

const getProductById = (req, res) => {
  const product = Product.getById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

const createProduct = (req, res) => {
  const { name, description, price, categoryId, stock } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'name, price, and categoryId are required' });
  }
  const product = Product.create({ name, description, price: Number(price), categoryId, stock: Number(stock) || 0 });
  res.status(201).json(product);
};

const updateProduct = (req, res) => {
  const product = Product.update(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

const deleteProduct = (req, res) => {
  const deleted = Product.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

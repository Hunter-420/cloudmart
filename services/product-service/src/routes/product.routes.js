const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');

// GET /api/products?category=cat-id&page=1&limit=20
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products
router.post('/', createProduct);

// PUT /api/products/:id
router.put('/:id', updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;

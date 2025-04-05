const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice) {
      filter.price = { $gte: req.query.minPrice };
    }
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: req.query.maxPrice };
    }

    // Search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name icon');

    const count = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');
      
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create product (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, description, price, category, stock, images } = req.body;
    
    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product data' });
  }
});

// PUT update product (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data' });
  }
});

// DELETE product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
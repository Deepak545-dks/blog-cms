import Page from '../models/pageModel.js';

// Helper to slugify text
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
export const createPage = async (req, res, next) => {
  try {
    const { title, slug } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please add a page title');
    }

    const pageSlug = slug ? slugify(slug) : slugify(title);

    // Check duplicate slug
    const duplicate = await Page.findOne({ slug: pageSlug });
    if (duplicate) {
      res.status(400);
      throw new Error('A page with this slug or title already exists');
    }

    const page = await Page.create({
      title,
      slug: pageSlug,
      layout: [],
      author: req.user._id,
    });

    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's pages
// @route   GET /api/pages
// @access  Private
export const getPages = async (req, res, next) => {
  try {
    const query = { author: req.user._id };
    const pages = await Page.find(query).sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single page by ID
// @route   GET /api/pages/:id
// @access  Private
export const getPageById = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404);
      throw new Error('Page not found');
    }

    // Verify ownership
    if (page.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this page');
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
};

// @desc    Get page layout by slug (Public API)
// @route   GET /api/pages/slug/:slug
// @access  Public
export const getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug.toLowerCase() });

    if (!page) {
      res.status(404);
      throw new Error('Page not found');
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
};

// @desc    Update page title, slug, or layout JSON
// @route   PUT /api/pages/:id
// @access  Private
export const updatePage = async (req, res, next) => {
  try {
    const { title, slug, layout } = req.body;
    const page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404);
      throw new Error('Page not found');
    }

    // Verify ownership
    if (page.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this page');
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (layout) updateData.layout = layout;
    
    if (slug) {
      const pageSlug = slugify(slug);
      if (pageSlug !== page.slug) {
        const duplicate = await Page.findOne({ slug: pageSlug });
        if (duplicate && duplicate._id.toString() !== req.params.id) {
          res.status(400);
          throw new Error('A page with this slug already exists');
        }
        updateData.slug = pageSlug;
      }
    }

    const updatedPage = await Page.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedPage);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private
export const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404);
      throw new Error('Page not found');
    }

    // Verify ownership
    if (page.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this page');
    }

    await Page.findByIdAndDelete(req.params.id);

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

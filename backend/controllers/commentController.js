import Comment from '../models/commentModel.js';

// @desc    Add a comment to a blog post
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { blogId, content } = req.body;

    if (!content || !content.trim()) {
      res.status(400);
      throw new Error('Comment content cannot be empty');
    }

    if (!blogId) {
      res.status(400);
      throw new Error('Please specify a target blog post ID');
    }

    const comment = await Comment.create({
      user: req.user._id,
      blog: blogId,
      content,
    });

    // Populate user profile info before returning
    const populated = await Comment.findById(comment._id).populate('user', 'name profileImage');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a blog post
// @route   GET /api/comments/blog/:blogId
// @access  Public
export const getBlogComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    // Verify comment owner or admin
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment removed successfully' });
  } catch (error) {
    next(error);
  }
};

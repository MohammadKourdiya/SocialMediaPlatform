const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middlewares/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const postController = require("../controllers/post.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - content
 *         - user
 *       properties:
 *         content:
 *           type: string
 *           description: Content of the post
 *         location:
 *           type: string
 *           description: Location associated with the post
 *         privacyLevel:
 *           type: string
 *           enum: [public, friends, private]
 *           description: Privacy level of the post
 *         user:
 *           type: object
 *           description: User who created the post
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 */
router.get("/home", protect, postController.getAllPost);
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               location:
 *                 type: string
 *               privacyLevel:
 *                 type: string
 *                 enum: [public, friends, private]
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.post("/", protect, upload.single("file"), postController.addNewPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get single post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               location:
 *                 type: string
 *               privacyLevel:
 *                 type: string
 *                 enum: [public, friends, private]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.get("/myposts", protect, postController.getUserPost);

router.delete("/:id", protect, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like/Unlike post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 likeCount:
 *                   type: integer
 *                 isLiked:
 *                   type: boolean
 */
router.post("/:id/like", protect, postController.likePost);

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - user
 *         - post
 *       properties:
 *         content:
 *           type: string
 *           description: محتوى التعليق
 *         user:
 *           type: object
 *           description: المستخدم الذي كتب التعليق
 *         post:
 *           type: string
 *           description: معرف المنشور الذي تم التعليق عليه
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاريخ إنشاء التعليق
 */

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: إضافة تعليق جديد على منشور
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المنشور
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: محتوى التعليق
 *     responses:
 *       201:
 *         description: تم إضافة التعليق بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *   get:
 *     summary: الحصول على تعليقات منشور معين
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف المنشور
 *     responses:
 *       200:
 *         description: تم جلب التعليقات بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: لم يتم العثور على تعليقات
 */

router.post("/:id/comments", protect, postController.addComment);
router.get("/:id/comments", postController.getCommentsOfPost);

router.get("/user/:userId", postController.getUserPostById);

module.exports = router;

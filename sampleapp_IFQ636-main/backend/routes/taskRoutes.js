const express = require('express');
const Task = require('../models/Task');

const objectId = /^[a-f\d]{24}$/i;

function taskFields(body) {
  const fields = {};
  const types = {
    title: 'string',
    description: 'string',
    price: 'number',
    stockNumber: 'number',
    image: 'string',
  };

  for (const [field, type] of Object.entries(types)) {
    if (!Object.prototype.hasOwnProperty.call(body ?? {}, field)) continue;

    const value = body[field];

    if (typeof value !== type || (type === 'number' && !Number.isFinite(value))) {
      throw new TaskInputError(`${field} must be a valid ${type}.`);
    }

    if (
      field === 'image' &&
      value !== '' &&
      !/^[a-z0-9][a-z0-9 _-]*\.(?:jpe?g|png|webp|gif)$/i.test(value)
    ) {
      throw new TaskInputError('Choose a valid product image filename.');
    }

    fields[field] = value;
  }

  return fields;
}

class TaskInputError extends Error {}


function handle(handler) {
  return (req, res, next) => handler(req, res).catch(next);
}

module.exports = function createTaskRoutes(protect) {
  const router = express.Router();

router.get('/catalog', handle(async (req, res) => {
  const products = await Task.find()
    .select('title price stockNumber image')
    .sort({ createdAt: -1 })
    .lean();

  res.json(products.map((product) => ({
    _id: product._id,
    title: product.title,
    price: product.price,
    image: product.image,
    inStock: product.stockNumber > 0,
  })));
}));


  router.use(protect);
  router.use((req, res, next) => {
    const userId = req.user?._id ?? req.user?.id;
    if (!objectId.test(String(userId))) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    req.taskUserId = userId;
    next();
  });

  router.get('/', handle(async (req, res) => {
    const tasks = await Task.find({ user: req.taskUserId }).sort({ createdAt: -1 });
    res.json(tasks);
  }));

  router.post('/', handle(async (req, res) => {
    const task = await Task.create({ ...taskFields(req.body), user: req.taskUserId });
    res.status(201).json(task);
  }));

  router.param('taskId', (req, res, next, taskId) => {
    if (!objectId.test(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID.' });
    }
    next();
  });

  const update = handle(async (req, res) => {
    const fields = taskFields(req.body);
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Provide a title, description or deadline.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, user: req.taskUserId },
      { $set: fields },
      { new: true, runValidators: true },
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  });
  router.put('/:taskId', update);
  router.patch('/:taskId', update);

  router.delete('/:taskId', handle(async (req, res) => {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      user: req.taskUserId,
    });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  }));

  router.use((error, req, res, next) => {
    if (error instanceof TaskInputError || error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  });

  return router;
};

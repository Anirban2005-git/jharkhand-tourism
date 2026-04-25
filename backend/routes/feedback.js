import express from 'express';

const router = express.Router();
const feedbackStore = [];

function estimateSentiment(comment) {
  const text = comment.toLowerCase();
  if (text.includes('excellent') || text.includes('great') || text.includes('love') || text.includes('awesome')) {
    return 'Positive';
  }
  if (text.includes('bad') || text.includes('poor') || text.includes('terrible') || text.includes('slow')) {
    return 'Negative';
  }
  return 'Neutral';
}

router.post('/', (req, res) => {
  const { userName = 'Anonymous', comment, source = 'manual' } = req.body;

  if (!comment || !comment.toString().trim()) {
    return res.status(400).json({ success: false, error: 'Comment is required' });
  }

  const feedbackItem = {
    id: `fb_${Date.now()}`,
    userName,
    comment: comment.toString().trim(),
    source,
    sentiment: estimateSentiment(comment.toString()),
    createdAt: new Date().toISOString(),
  };

  feedbackStore.unshift(feedbackItem);

  res.json({ success: true, message: 'Feedback submitted successfully', data: feedbackItem });
});

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  res.json({ success: true, data: feedbackStore.slice(0, limit) });
});

export default router;

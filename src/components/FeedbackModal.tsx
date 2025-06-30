import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { FeedbackData } from '../types';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [helpful, setHelpful] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment, helpful });
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
      <div className="modal-content rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Share Your Feedback</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700/50 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-4">
              How would you rate this fact-check?
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-transform duration-200"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-current' : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Helpful Toggle */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-4">
              Was this analysis helpful?
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors duration-200 border ${
                  helpful
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-neutral-700/30 text-neutral-400 border-neutral-600/30'
                }`}
              >
                Yes, helpful
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors duration-200 border ${
                  !helpful
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-neutral-700/30 text-neutral-400 border-neutral-600/30'
                }`}
              >
                Not helpful
              </button>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-neutral-300 mb-4">
              Additional comments (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 input-field rounded-xl text-white placeholder-neutral-500 font-light resize-none"
              placeholder="Tell us how we can improve..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 cta-button rounded-xl text-white font-semibold spectrum-button"
          >
            <Send className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>
        </form>

        <p className="text-xs text-neutral-500 text-center mt-6 font-light">
          Your feedback helps us improve our fact-checking accuracy and user experience.
        </p>
      </div>
    </div>
  );
};

export default FeedbackModal;
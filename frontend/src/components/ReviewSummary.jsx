import { useMemo } from "react";

export default function ReviewSummary({ reviews }) {
  const summary = useMemo(() => {
    if (!reviews || reviews.length < 3) return null;

    const keywords = {};
    const sentiments = { positive: 0, negative: 0, neutral: 0 };

    const positiveWords = ["great", "amazing", "delicious", "excellent", "love", "best", "perfect", "wonderful", "fantastic", "fresh", "tasty", "friendly", "beautiful", "cozy", "authentic"];
    const negativeWords = ["bad", "terrible", "slow", "cold", "rude", "dirty", "expensive", "disappointing", "worst", "bland", "stale"];

    reviews.forEach((rv) => {
      const words = rv.c.toLowerCase().split(/\s+/);
      let sentiment = "neutral";

      words.forEach((word) => {
        const clean = word.replace(/[^a-z]/g, "");
        if (clean.length < 3) return;

        if (positiveWords.includes(clean)) {
          sentiment = "positive";
          keywords[clean] = (keywords[clean] || 0) + 1;
        } else if (negativeWords.includes(clean)) {
          sentiment = "negative";
          keywords[clean] = (keywords[clean] || 0) + 1;
        }
      });

      sentiments[sentiment]++;
    });

    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const totalSentiments = sentiments.positive + sentiments.negative + sentiments.neutral;
    const posPercent = Math.round((sentiments.positive / totalSentiments) * 100);
    const negPercent = Math.round((sentiments.negative / totalSentiments) * 100);

    const avgRating = reviews.reduce((s, r) => s + r.r, 0) / reviews.length;

    let overallSentiment = "Mixed feelings";
    if (posPercent > 70) overallSentiment = "Highly recommended! 🌟";
    else if (posPercent > 50) overallSentiment = "Generally positive 👍";
    else if (negPercent > 50) overallSentiment = "Needs improvement 📝";

    return {
      total: reviews.length,
      avgRating: avgRating.toFixed(1),
      posPercent,
      negPercent,
      neutralPercent: 100 - posPercent - negPercent,
      topKeywords,
      overallSentiment,
      sentiments,
    };
  }, [reviews]);

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🤖</span>
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI REVIEW SUMMARY</p>
          <p className="text-sm font-black text-gray-900">Based on {summary.total} reviews</p>
        </div>
        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">AI</span>
      </div>

      {/* Overall */}
      <div className="bg-white rounded-xl p-3 mb-3 flex items-center justify-between">
        <div>
          <p className="font-black text-lg text-gray-900">★ {summary.avgRating}</p>
          <p className="text-xs text-gray-500 font-medium">{summary.overallSentiment}</p>
        </div>
        <div className="flex gap-1">
          <div className="text-center px-2">
            <p className="font-black text-green-600">{summary.posPercent}%</p>
            <p className="text-[9px] text-gray-400">Positive</p>
          </div>
          <div className="text-center px-2">
            <p className="font-black text-gray-500">{summary.neutralPercent}%</p>
            <p className="text-[9px] text-gray-400">Neutral</p>
          </div>
          <div className="text-center px-2">
            <p className="font-black text-red-500">{summary.negPercent}%</p>
            <p className="text-[9px] text-gray-400">Negative</p>
          </div>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex mb-3">
        <div className="bg-green-500 h-full" style={{ width: `${summary.posPercent}%` }} />
        <div className="bg-gray-300 h-full" style={{ width: `${summary.neutralPercent}%` }} />
        <div className="bg-red-400 h-full" style={{ width: `${summary.negPercent}%` }} />
      </div>

      {/* Keywords */}
      {summary.topKeywords.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Common Mentions</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.topKeywords.map(([word, count]) => (
              <span key={word} className="text-[11px] bg-white px-2 py-1 rounded-lg border border-blue-100 font-medium text-blue-700">
                {word} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
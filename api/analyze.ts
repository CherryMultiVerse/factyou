export default async function handler(req, res) {
  // Fake delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulated mock data
  const mockResponse = {
    overallRating: "MIXED",
    sources: [
      {
        name: "LeftBiasNews.com",
        bias: "Left",
        credibility: "High",
        summary: "This source confirms part of the claim but adds additional nuance.",
        url: "https://leftbiasnews.com/article"
      },
      {
        name: "RightWingTruth.org",
        bias: "Right",
        credibility: "Medium",
        summary: "This source disputes the claim based on different framing.",
        url: "https://rightwingtruth.org/fact-check"
      },
      {
        name: "CenterFact.net",
        bias: "Center",
        credibility: "High",
        summary: "This independent checker finds the claim partly misleading.",
        url: "https://centerfact.net/claim-review"
      }
    ]
  };

  res.status(200).json(mockResponse);
}
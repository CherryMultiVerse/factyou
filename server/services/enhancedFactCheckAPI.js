import axios from 'axios';

export class EnhancedFactCheckAPI {
  constructor() {
    this.timeout = 10000;
  }

  async checkClaim(claim) {
    console.log(`🔍 Checking external fact-check APIs for: "${claim.substring(0, 50)}..."`);
    
    // For now, return empty array since we don't have API keys configured
    // This prevents the system from failing
    return [];
  }
}
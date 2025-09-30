// Backend থেকে token generate করে নিয়ে আসে
export const tokenService = {
  // User token generate করে
  async generateUserToken(userId) {
    try {
      // ⚠️ গুরুত্বপূর্ণ: তোমার backend URL দিয়ে replace করো
      const BACKEND_URL = 'http://localhost:8080'; // তোমার backend এর URL এখানে দিবে
      
      const response = await fetch(
        `${BACKEND_URL}/api/token/generateUserToken?account=${userId}&expireTimeInSeconds=3600`
      );
      console.log('response:', response);
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.token;
      } else {
        throw new Error('Token generation failed');
      }
    } catch (error) {
      console.error('Token fetch error:', error);
      throw error;
    }
  }
};
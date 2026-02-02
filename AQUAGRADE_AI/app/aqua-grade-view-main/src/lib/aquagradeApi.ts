const API_BASE_URL = 'http://localhost:5001/api';

export interface AnalysisResult {
  quality: {
    grade: string;
    score: number;
    factors: string[];
  };
  species: {
    name: string;
    scientificName: string;
    confidence: string;
  };
  size: {
    weight: string;
    length: string;
    category: string;
  };
  market: {
    totalValue: string;
    basePrice: string;
    premium: string;
    pricePerPound: string;
  };
  trends: {
    currentTrend: string;
    priceChange: string;
    demandLevel: string;
    seasonalFactor: string;
  };
  handling: {
    recommendations: string[];
    storageTemp: string;
    shelfLife: string;
  };
  timestamp: string;
}

class AquaGradeAPI {
  // Convert file to base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Analyze single fish
  static async analyzeFish(imageFile: File, options: { debug?: boolean; saveToDb?: boolean } = {}): Promise<AnalysisResult> {
    try {
      const base64 = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          debug: options.debug || false,
          save_to_db: options.saveToDb !== false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform the API response to match the expected interface
      return {
        quality: {
          grade: result.quality.grade,
          score: result.quality.score,
          factors: [
            `Eye Clarity: ${result.quality.eyeClarity}%`,
            `Gill Color: ${result.quality.gillColor}%`,
            `Skin Condition: ${result.quality.skinCondition}%`
          ]
        },
        species: {
          name: result.species.name,
          scientificName: result.species.name, // Use same name for now
          confidence: result.species.confidence
        },
        size: {
          weight: result.size.weight,
          length: result.size.length,
          category: result.size.category
        },
        market: {
          totalValue: result.market.totalValue,
          basePrice: result.market.basePrice,
          premium: result.market.premium,
          pricePerPound: result.market.totalValue // Use total value for now
        },
        trends: {
          currentTrend: result.trends.currentTrend,
          priceChange: result.trends.priceChange,
          demandLevel: result.trends.demandLevel,
          seasonalFactor: result.trends.seasonalFactor
        },
        handling: {
          recommendations: [
            `Quality: ${result.quality.grade} - Monitor temperature and handling`,
            `Species: ${result.species.name} - Handle with care`,
            `Size: ${result.size.category} - May require special handling equipment`
          ],
          storageTemp: '0-4°C',
          shelfLife: '2-3 days'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  // Get analysis history
  static async getHistory(limit = 50, offset = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/history?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get history:', error);
      throw error;
    }
  }

  // Get market data
  static async getMarketData() {
    try {
      const response = await fetch(`${API_BASE_URL}/market-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get market data:', error);
      throw error;
    }
  }

  // Batch analysis
  static async analyzeBatch(imageFiles: File[], options: { saveToDb?: boolean } = {}) {
    try {
      const base64Images = await Promise.all(
        imageFiles.map(file => this.fileToBase64(file))
      );

      const response = await fetch(`${API_BASE_URL}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images,
          save_to_db: options.saveToDb !== false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch analysis failed:', error);
      throw error;
    }
  }

  // Get supported species
  static async getSpecies() {
    try {
      const response = await fetch(`${API_BASE_URL}/species`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get species:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export default AquaGradeAPI;

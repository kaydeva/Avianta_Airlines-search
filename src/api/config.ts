import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing. Add it to your .env file.");
}

export interface ExchangeRates {
  baseCurrency: string;
  rates: Record<string, number>;
}

export async function getExchangeRates(baseCurrency = 'USD'): Promise<ExchangeRates> {
  const response = await axios.get(`${API_URL}/api/config/getExchangeRates`, {
    params: { baseCurrency },
  });
  const data = response.data?.data || response.data;
  return {
    baseCurrency,
    rates: data?.rates || data || {},
  };
}

export async function getLocale(): Promise<any> {
  const response = await axios.get(`${API_URL}/api/config/getLocale`);
  return response.data?.data || response.data;
}

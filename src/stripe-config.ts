export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
  currency?: string;
  popular?: boolean;
  emoji?: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_1_dollar',
    priceId: 'price_1RfQE1FkszgPHpsuREPrUjEq',
    name: '$1.00',
    description: 'If everyone gives a buck, we\'ll be fact as F@ck!',
    mode: 'payment',
    price: 1.00,
    currency: 'usd',
    emoji: '💵'
  },
  {
    id: 'prod_5_dollar',
    priceId: 'price_1RfQPhFkszgPHpsuR9vODdoM',
    name: 'Black Coffee',
    description: 'Fuel our late-night fact-checking sessions with premium caffeine.',
    mode: 'payment',
    price: 5.00,
    currency: 'usd',
    popular: true,
    emoji: '☕'
  },
  {
    id: 'prod_10_dollar',
    priceId: 'price_1RfQQNFkszgPHpsuaMCxxVK5',
    name: 'Middle Finger',
    description: 'A polite gesture to misinformation and those who spread it.',
    mode: 'payment',
    price: 10.00,
    currency: 'usd',
    emoji: '🖕'
  },
  {
    id: 'prod_25_dollar',
    priceId: 'price_1RfQT3FkszgPHpsuPobCWOhQ',
    name: 'Baller',
    description: 'You\'re officially a high-roller in the truth-telling game.',
    mode: 'payment',
    price: 25.00,
    currency: 'usd',
    emoji: '💎'
  },
  {
    id: 'prod_custom',
    priceId: 'price_1RfQKGFkszgPHpsum8yMNK2c',
    name: 'Custom Amount',
    description: 'Internet rich dopamine hit. Stick it to the man.',
    mode: 'payment',
    price: 0, // Will be set dynamically
    currency: 'usd',
    emoji: '🚀'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};
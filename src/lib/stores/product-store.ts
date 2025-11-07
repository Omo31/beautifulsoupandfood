
import type { Product } from '@/lib/data';

const initialProducts: Product[] = [
  { id: '1', name: 'Jollof Rice Mix', description: 'The perfect blend of spices for authentic Nigerian Jollof Rice.', price: 5.99, category: 'foodstuff', stock: 150, imageId: 'jollof-rice', rating: 4.8, reviewCount: 120 },
  { id: '2', name: 'Egusi Soup', description: 'Ready-to-eat classic Egusi soup, rich and flavorful.', price: 12.50, category: 'soup', stock: 50, imageId: 'egusi-soup', rating: 4.9, reviewCount: 98 },
  { id: '3', name: 'Suya Spice', description: 'Authentic Yaji spice for your homemade Suya.', price: 4.50, category: 'foodstuff', stock: 200, imageId: 'suya', rating: 4.7, reviewCount: 88 },
  { id: '4', name: 'Pounded Yam Flour', description: 'Instant flour for smooth and delicious pounded yam.', price: 8.99, category: 'foodstuff', stock: 100, imageId: 'pounded-yam', rating: 4.6, reviewCount: 150 },
  { id: '5', name: 'Ogbono Soup', description: 'A savory and aromatic Ogbono soup, ready to heat.', price: 13.00, category: 'soup', stock: 45, imageId: 'ogbono-soup', rating: 4.8, reviewCount: 75 },
  { id: '6', name: 'Afang Soup', description: 'A hearty vegetable soup made with Afang leaves.', price: 14.50, category: 'soup', stock: 30, imageId: 'afang-soup', rating: 4.9, reviewCount: 62 },
  { id: '7', name: 'Banga Soup', description: 'Rich and flavorful soup made from palm fruit concentrate.', price: 13.50, category: 'soup', stock: 40, imageId: 'banga-soup', rating: 4.7, reviewCount: 55 },
  { id: '8', name: 'Fried Plantain (Dodo)', description: 'Sweet, ripe plantains fried to perfection.', price: 6.50, category: 'foodstuff', stock: 80, imageId: 'plantain', rating: 4.9, reviewCount: 210 },
  { id: '9', name: 'Gari', description: 'Crisp cassava flakes, perfect for soaking or making Eba.', price: 3.99, category: 'foodstuff', stock: 300, imageId: 'gari', rating: 4.5, reviewCount: 180 },
  { id: '10', name: 'Red Palm Oil', description: '1 liter of pure, unrefined red palm oil.', price: 9.99, category: 'foodstuff', stock: 120, imageId: 'palm-oil', rating: 4.7, reviewCount: 95 },
  { id: '11', name: 'Yam Tuber', description: 'A large, fresh yam tuber. Price per tuber.', price: 7.50, category: 'foodstuff', stock: 90, imageId: 'yam-tuber', rating: 4.6, reviewCount: 70 },
  { id: '12', name: 'Dried Crayfish', description: 'Ground crayfish for adding flavor to soups and stews.', price: 6.25, category: 'foodstuff', stock: 180, imageId: 'crayfish', rating: 4.8, reviewCount: 110 },
  { id: '13', name: 'Oha Soup', description: 'A traditional soup made with tender Oha leaves.', price: 14.00, category: 'soup', stock: 25, imageId: 'oha-soup', rating: 4.9, reviewCount: 45 },
  { id: '14', name: 'Edikang Ikong Soup', description: 'A nutritious Calabar vegetable soup.', price: 15.00, category: 'soup', stock: 20, imageId: 'edikang-ikong', rating: 5.0, reviewCount: 58 },
  { id: '15', name: 'Bitterleaf Soup', description: 'A savory soup with a unique, pleasant bitter taste.', price: 13.00, category: 'soup', stock: 35, imageId: 'bitterleaf-soup', rating: 4.7, reviewCount: 68 },
];

let products: Product[] = initialProducts;
let listeners: (() => void)[] = [];

const productStore = {
  getSnapshot() {
    return products;
  },

  getServerSnapshot() {
    return initialProducts;
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  addProduct(product: Product) {
    products = [product, ...products];
    listeners.forEach(l => l());
  },

  updateProduct(updatedProduct: Product) {
    products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    listeners.forEach(l => l());
  },

  deleteProduct(productId: string) {
    products = products.filter(p => p.id !== productId);
    listeners.forEach(l => l());
  },
  
  findById(id: string | undefined): Product | undefined {
    if (!id) return undefined;
    return products.find(p => p.id === id);
  }
};

export default productStore;

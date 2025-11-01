export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'foodstuff' | 'soup';
  stock: number;
  imageId: string;
  rating: number;
  reviewCount: number;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  comment: string;
  imageId: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Customer';
    lastLogin: string;
    avatarId: string;
};

export type Order = {
    id: string;
    customerName: string;
    date: string;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    itemCount: number;
};

export const products: Product[] = [
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

export const testimonials: Testimonial[] = [
    { id: '1', name: 'Adeola Adebayo', location: 'Lagos, NG', comment: 'The quality of the ingredients is unmatched! My Jollof rice has never tasted better. Highly recommended for anyone who misses the taste of home.', imageId: 'testimonial-1' },
    { id: '2', name: 'Chiamaka Nwosu', location: 'London, UK', comment: 'BeautifulSoup&Food is a lifesaver. I ordered the Egusi soup, and it tasted just like my mother\'s. The delivery was fast and the packaging was excellent.', imageId: 'testimonial-2' },
    { id: '3', name: 'Emeka Okafor', location: 'Houston, USA', comment: 'I finally found a reliable source for all my Nigerian foodstuffs. The prices are fair, and the customer service is top-notch. Five stars!', imageId: 'testimonial-3' },
];

export const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', lastLogin: '2024-05-20T10:00:00Z', avatarId: 'avatar-1' },
    { id: '2', name: 'John Doe', email: 'johndoe@example.com', role: 'Customer', lastLogin: '2024-05-20T12:30:00Z', avatarId: 'avatar-1' },
    { id: '3', name: 'Jane Smith', email: 'janesmith@example.com', role: 'Customer', lastLogin: '2024-05-19T18:45:00Z', avatarId: 'avatar-1' },
    { id: '4', name: 'Peter Jones', email: 'peterjones@example.com', role: 'Customer', lastLogin: '2024-05-20T09:15:00Z', avatarId: 'avatar-1' },
];

export const orders: Order[] = [
    { id: 'ORD-001', customerName: 'John Doe', date: '2024-05-20', status: 'Delivered', total: 45.99, itemCount: 3 },
    { id: 'ORD-002', customerName: 'Jane Smith', date: '2024-05-19', status: 'Shipped', total: 89.50, itemCount: 5 },
    { id: 'ORD-003', customerName: 'Peter Jones', date: '2024-05-20', status: 'Pending', total: 25.00, itemCount: 2 },
    { id: 'ORD-004', customerName: 'John Doe', date: '2024-05-18', status: 'Delivered', total: 112.75, itemCount: 8 },
];

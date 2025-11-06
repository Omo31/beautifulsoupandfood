
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
    role: 'Owner' | 'Customer' | 'Content Manager';
    lastLogin: string;
    avatarId: string;
    status: 'Active' | 'Disabled';
    joinDate: string;
};

export type Order = {
    id: string;
    customerName: string;
    date: string;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Awaiting Confirmation';
    total: number;
    itemCount: number;
};

export type PurchaseOrderItem = {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  cost: number;
};

export type PurchaseOrder = {
  id: string;
  supplier: string;
  date: string;
  status: 'Draft' | 'Pending' | 'Completed' | 'Cancelled';
  items: PurchaseOrderItem[];
  total: number;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: 'Sale' | 'Supplies' | 'Marketing' | 'Salaries' | 'Other';
  type: 'Sale' | 'Expense';
  amount: number;
};

export type Message = {
    id: string;
    sender: 'customer' | 'admin';
    text: string;
    timestamp: string;
};

export type Conversation = {
    id: string;
    customerId: string;
    customerName: string;
    customerAvatarId: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    unread: boolean;
    messages: Message[];
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
    { id: '1', name: 'Owner User', email: 'owner@example.com', role: 'Owner', lastLogin: '2024-05-20T10:00:00Z', avatarId: 'avatar-1', status: 'Active', joinDate: '2023-01-15T10:00:00Z' },
    { id: '2', name: 'John Doe', email: 'johndoe@example.com', role: 'Customer', lastLogin: '2024-05-20T12:30:00Z', avatarId: 'avatar-1', status: 'Active', joinDate: '2023-03-22T11:00:00Z' },
    { id: '3', name: 'Jane Smith', email: 'janesmith@example.com', role: 'Content Manager', lastLogin: '2024-05-19T18:45:00Z', avatarId: 'avatar-1', status: 'Active', joinDate: '2023-02-10T14:20:00Z' },
    { id: '4', name: 'Peter Jones', email: 'peterjones@example.com', role: 'Customer', lastLogin: '2024-05-20T09:15:00Z', avatarId: 'avatar-1', status: 'Disabled', joinDate: '2023-04-01T09:15:00Z' },
    { id: '5', name: 'Chioma Okoro', email: 'chioma.okoro@example.com', role: 'Customer', lastLogin: '2024-05-21T14:00:00Z', avatarId: 'testimonial-2', status: 'Active', joinDate: '2023-05-12T18:00:00Z' },
    { id: '6', name: 'Bayo Ojo', email: 'bayo.ojo@example.com', role: 'Customer', lastLogin: '2024-05-22T08:00:00Z', avatarId: 'testimonial-3', status: 'Active', joinDate: '2023-06-30T20:00:00Z' },
];

export const orders: Order[] = [
    { id: 'ORD-001', customerName: 'John Doe', date: '2024-05-20', status: 'Delivered', total: 45.99, itemCount: 3 },
    { id: 'ORD-002', customerName: 'Jane Smith', date: '2024-05-19', status: 'Shipped', total: 89.50, itemCount: 5 },
    { id: 'ORD-003', customerName: 'Peter Jones', date: '2024-05-20', status: 'Pending', total: 25.00, itemCount: 2 },
    { id: 'ORD-004', customerName: 'John Doe', date: '2024-05-18', status: 'Delivered', total: 112.75, itemCount: 8 },
    { id: 'ORD-005', customerName: 'Chioma Okoro', date: '2024-05-21', status: 'Awaiting Confirmation', total: 0.00, itemCount: 4 },
];

export const purchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-2024-001',
        supplier: 'Global Food Imports',
        date: '2024-05-15',
        status: 'Completed',
        items: [
            { id: '1', productName: 'Pounded Yam Flour', productId: 'PYF-001', quantity: 100, cost: 5.50 },
            { id: '2', productName: 'Red Palm Oil', productId: 'RPO-001', quantity: 50, cost: 6.00 },
        ],
        total: 850.00
    },
    {
        id: 'PO-2024-002',
        supplier: 'Local Farms Ltd.',
        date: '2024-05-18',
        status: 'Pending',
        items: [
            { id: '1', productName: 'Yam Tuber', productId: 'YT-001', quantity: 200, cost: 4.00 },
            { id: '2', productName: 'Fresh Crayfish', productId: 'FC-001', quantity: 20, cost: 10.00 },
        ],
        total: 1000.00
    },
    {
        id: 'PO-2024-003',
        supplier: 'Spices &amp; More Co.',
        date: '2024-05-20',
        status: 'Draft',
        items: [
            { id: '1', productName: 'Jollof Rice Mix', productId: 'JRM-001', quantity: 50, cost: 3.50 },
        ],
        total: 175.00
    },
     {
        id: 'PO-2024-004',
        supplier: 'Global Food Imports',
        date: '2024-05-21',
        status: 'Cancelled',
        items: [
            { id: '1', productName: 'Gari', productId: 'GARI-001', quantity: 150, cost: 2.00 },
        ],
        total: 300.00
    },
];

export const transactions: Transaction[] = [
    { id: 'TRN-001', date: '2024-05-20', description: 'Sale from Order ORD-001', category: 'Sale', type: 'Sale', amount: 45.99 },
    { id: 'TRN-002', date: '2024-05-20', description: 'Packaging Supplies', category: 'Supplies', type: 'Expense', amount: 25.00 },
    { id: 'TRN-003', date: '2024-05-19', description: 'Sale from Order ORD-002', category: 'Sale', type: 'Sale', amount: 89.50 },
    { id: 'TRN-004', date: '2024-05-19', description: 'Facebook Ad Campaign', category: 'Marketing', type: 'Expense', amount: 50.00 },
    { id: 'TRN-005', date: '2024-05-18', description: 'Sale from Order ORD-004', category: 'Sale', type: 'Sale', amount: 112.75 },
    { id: 'TRN-006', date: '2024-05-17', description: 'May Salaries', category: 'Salaries', type: 'Expense', amount: 1500.00 },
];

export const conversations: Conversation[] = [
    {
        id: 'CONV-001',
        customerId: '2',
        customerName: 'John Doe',
        customerAvatarId: 'avatar-1',
        lastMessage: 'Great, thank you for the help!',
        lastMessageTimestamp: '10:45 AM',
        unread: false,
        messages: [
            { id: 'msg1', sender: 'customer', text: 'Hi, I have a question about my order.', timestamp: '10:30 AM' },
            { id: 'msg2', sender: 'admin', text: 'Hello John, I\'d be happy to help. What is your order number?', timestamp: '10:31 AM' },
            { id: 'msg3', sender: 'customer', text: 'It\'s ORD-001. I was wondering about the delivery status.', timestamp: '10:32 AM' },
            { id: 'msg4', sender: 'admin', text: 'Let me check... It looks like your order was delivered this morning at 9:15 AM.', timestamp: '10:44 AM' },
            { id: 'msg5', sender: 'customer', text: 'Great, thank you for the help!', timestamp: '10:45 AM' },
        ],
    },
    {
        id: 'CONV-002',
        customerId: '5',
        customerName: 'Chioma Okoro',
        customerAvatarId: 'testimonial-2',
        lastMessage: 'Do you ship to the United States?',
        lastMessageTimestamp: 'Yesterday',
        unread: true,
        messages: [
            { id: 'msg1', sender: 'customer', text: 'Hello, I love your soups!', timestamp: 'Yesterday' },
            { id: 'msg2', sender: 'customer', text: 'Do you ship to the United States?', timestamp: 'Yesterday' },
        ],
    },
    {
        id: 'CONV-003',
        customerId: '6',
        customerName: 'Bayo Ojo',
        customerAvatarId: 'testimonial-3',
        lastMessage: 'Perfect, I will place my order now.',
        lastMessageTimestamp: '2 days ago',
        unread: false,
        messages: [
            { id: 'msg1', sender: 'customer', text: 'Is the Banga soup spicy?', timestamp: '2 days ago' },
            { id: 'msg2', sender: 'admin', text: 'Hi Bayo, our Banga soup has a mild to medium spice level. We can make it spicier on request for a custom order.', timestamp: '2 days ago' },
            { id: 'msg3', sender: 'customer', text: 'Perfect, I will place my order now.', timestamp: '2 days ago' },
        ],
    },
];

export type QuoteStatus = 'Quote Ready' | 'Pending Review' | 'Accepted' | 'Expired' | 'Rejected' | 'Awaiting Revision';
export type Quote = {
  id: string;
  date: string;
  status: QuoteStatus;
  total: number | null;
  customerName: string;
  itemCount: number;
};
export const quotes: Quote[] = [
    { id: 'QT-001', date: '2024-05-22', status: 'Quote Ready', total: 28500.00, customerName: 'John Doe', itemCount: 2 },
    { id: 'QT-002', date: '2024-05-21', status: 'Pending Review', total: null, customerName: 'Chioma Okoro', itemCount: 1 },
    { id: 'QT-003', date: '2024-05-18', status: 'Accepted', total: 15750.00, customerName: 'Bayo Ojo', itemCount: 3 },
    { id: 'QT-004', date: '2024-05-17', status: 'Expired', total: 5500.00, customerName: 'Jane Smith', itemCount: 1 },
    { id: 'QT-005', date: '2024-05-23', status: 'Awaiting Revision', total: null, customerName: 'Peter Jones', itemCount: 2 },
];

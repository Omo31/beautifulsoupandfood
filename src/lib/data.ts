

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

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: string;
  role: 'Customer' | 'Content Manager' | 'Owner';
  wishlist?: string[];
  createdAt: any; // Firestore Timestamp
};

export type Review = {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: any; // Firestore Timestamp
};


export type Testimonial = {
  id:string;
  name: string;
  location: string;
  comment: string;
  imageId: string;
};

export type Order = {
    id: string;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Awaiting Confirmation';
    total: number;
    itemCount: number;
    createdAt: any; // Firestore Timestamp
};

export type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    productId: string;
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
  date: any; // Firestore Timestamp
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

export type HomepageService = {
  id: string;
  name: string;
  description: string;
  iconName: 'PackageSearch' | 'Gift' | 'Boxes';
};

export type QuoteStatus = 'Quote Ready' | 'Pending Review' | 'Accepted' | 'Rejected' | 'Expired' | 'Paid';

export type QuoteRequest = {
  id?: string;
  userId: string;
  status: QuoteStatus;
  createdAt: any; // ServerTimestamp
  items: QuoteItem[];
  services?: string[];
  notes?: string;
  shippingMethod: 'pickup' | 'lagos' | 'quote';
  lga?: string;
  shippingAddress?: string;
  name: string;
  email: string;
  phone: string;
};

export type QuoteItem = {
    name: string;
    quantity: number;
    measure: string;
    customMeasure?: string;
};

export type Quote = {
  id: string;
  date: string;
  status: QuoteStatus;
  total: number | null;
  customerName: string;
  itemCount: number;
};

// All data has been moved to be fetched from Firestore or is mocked directly in components.
// This file now only contains type definitions.

export const homepageServices: HomepageService[] = [
    { id: '1', name: 'Custom Sourcing', description: 'Looking for a rare ingredient? We can find it for you.', iconName: 'PackageSearch'},
    { id: '2', name: 'Gift Wrapping', description: 'Send a taste of home as a beautifully wrapped gift.', iconName: 'Gift'},
    { id: '3', name: 'Bulk Orders', description: 'Catering for an event? We handle bulk orders with ease.', iconName: 'Boxes'},
];

// Mock data below this line is now DEPRECATED and will be removed.
export const purchaseOrders: PurchaseOrder[] = [];
export const conversations: Conversation[] = [];

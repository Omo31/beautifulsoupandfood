

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
};


export type Testimonial = {
  id:string;
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

export type HomepageService = {
  id: string;
  name: string;
  description: string;
  iconName: 'PackageSearch' | 'Gift' | 'Boxes';
};

export type QuoteStatus = 'Quote Ready' | 'Pending Review' | 'Accepted' | 'Expired' | 'Rejected' | 'Awaiting Revision';
export type Quote = {
  id: string;
  date: string;
  status: QuoteStatus;
  total: number | null;
  customerName: string;
  itemCount: number;
};

// All data has been moved to the /lib/stores directory to simulate a real-time database.
// This file now only contains type definitions.

export const testimonials: Testimonial[] = [
    { id: '1', name: 'Adeola Adebayo', location: 'Lagos, NG', comment: 'The quality of the ingredients is unmatched! My Jollof rice has never tasted better. Highly recommended for anyone who misses the taste of home.', imageId: 'testimonial-1' },
    { id: '2', name: 'Chiamaka Nwosu', location: 'London, UK', comment: 'BeautifulSoup&Food is a lifesaver. I ordered the Egusi soup, and it tasted just like my mother\'s. The delivery was fast and the packaging was excellent.', imageId: 'testimonial-2' },
    { id: '3', name: 'Emeka Okafor', location: 'Houston, USA', comment: 'I finally found a reliable source for all my Nigerian foodstuffs. The prices are fair, and the customer service is top-notch. Five stars!', imageId: 'testimonial-3' },
];

export const homepageServices: HomepageService[] = [
    { id: '1', name: 'Custom Sourcing', description: 'Looking for a rare ingredient? We can find it for you.', iconName: 'PackageSearch'},
    { id: '2', name: 'Gift Wrapping', description: 'Send a taste of home as a beautifully wrapped gift.', iconName: 'Gift'},
    { id: '3', name: 'Bulk Orders', description: 'Catering for an event? We handle bulk orders with ease.', iconName: 'Boxes'},
];

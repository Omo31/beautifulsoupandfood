
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import paystack from '@/lib/paystack';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.redirect(new URL('/cart?error=invalid_reference', req.url));
  }

  try {
    const response = await paystack.transaction.verify({ reference });

    if (response.data.status !== 'success') {
      return NextResponse.redirect(new URL(`/cart?error=${response.data.gateway_response}`, req.url));
    }
    
    // The actual order creation is handled by the webhook for reliability.
    // The callback URL's primary job is to redirect the user to a success or failure page.
    
    // Redirect to a generic success page or the orders list.
    return NextResponse.redirect(new URL('/account/orders', req.url));

  } catch (error) {
    console.error('Paystack verification error:', error);
    return NextResponse.redirect(new URL('/cart?error=verification_failed', req.url));
  }
}

    
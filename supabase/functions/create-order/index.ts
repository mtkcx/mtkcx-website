import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  variantSize?: string;
  imageUrl: string;
}

interface CustomerInfo {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  location: string;
  notes: string;
  paymentMethod: 'cash_on_delivery' | 'credit_card';
}

interface CreateOrderRequest {
  items: OrderItem[];
  customerInfo: CustomerInfo;
  shippingCost: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

     // Parse request body
    const { items, customerInfo, shippingCost, totalAmount }: CreateOrderRequest = await req.json();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Get authenticated user or create account for guest
    let userId = null;
    let accountCreated = false;
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        userId = data.user?.id || null;
      }
    } catch (error) {
      console.log('No authenticated user, will create account during checkout');
    }

    // If no authenticated user, create account automatically
    if (!userId) {
      try {
        console.log('🔐 Creating account for guest user:', customerInfo.email);
        
        // Generate a temporary password
        const tempPassword = `TempPass${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
        
        // Create user account using service role
        const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
          email: customerInfo.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: customerInfo.name,
            phone: customerInfo.phone,
            created_via: 'checkout_auto',
            temp_password: true
          }
        });

        if (authError) {
          console.error('❌ Account creation error:', authError);
          // Don't fail the order if account creation fails
        } else {
          userId = authData.user?.id;
          accountCreated = true;
          console.log('✅ Account created successfully for:', customerInfo.email);
          
          // Create profile for the new user
          const { error: profileError } = await supabaseService
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: customerInfo.name,
              phone: customerInfo.phone,
              address: customerInfo.address,
              city: customerInfo.city,
              country: 'Israel'
            });
            
          if (profileError) {
            console.error('❌ Profile creation error:', profileError);
          } else {
            console.log('✅ Profile created for new user');
          }
        }
      } catch (createError) {
        console.error('❌ Account creation failed:', createError);
        // Continue with guest order if account creation fails
      }
    }

    console.log('📝 Creating order for:', customerInfo.email);
    console.log('💰 Total amount:', totalAmount);
    console.log('👤 User ID:', userId || 'Guest order');
    console.log('💳 Payment method:', customerInfo.paymentMethod);

    // Generate secure session ID for guest orders
    let orderSessionId = null;
    if (!userId) {
      const { data: sessionData, error: sessionError } = await supabaseService
        .rpc('generate_order_session_id');
      
      if (sessionError) {
        console.error('Failed to generate session ID:', sessionError);
        throw new Error('Failed to create secure session');
      }
      orderSessionId = sessionData;
    }

    // Set secure context for RLS policy
    await supabaseService.rpc('set_order_context');

    // Create order in database with enhanced security
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        email: customerInfo.email,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_city: customerInfo.city,
        customer_country: 'Israel',
        amount: totalAmount,
        currency: 'ILS',
        status: 'pending',
        order_type: 'product',
        payment_gateway: customerInfo.paymentMethod,
        notes: customerInfo.notes,
        order_session_id: orderSessionId, // For guest order access
        items: items.map(item => ({
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          variant_size: item.variantSize
        }))
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      console.error('❌ Error details:', JSON.stringify(orderError, null, 2));
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('✅ Order created successfully:', order.id);

    // Log order creation for security audit
    try {
      await supabaseService.rpc('log_order_access', {
        p_order_id: order.id,
        p_action: 'order_creation',
        p_success: true
      });
    } catch (logError) {
      console.error('Failed to log order creation:', logError);
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      variant_size: item.variantSize
    }));

    const { error: itemsError } = await supabaseService
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError);
      // Log the failure but don't fail the whole order
      try {
        await supabaseService.rpc('log_order_access', {
          p_order_id: order.id,
          p_action: 'order_items_creation',
          p_success: false
        });
      } catch (logError) {
        console.error('Failed to log order items error:', logError);
      }
    }

    // Send order confirmation email
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

      const paymentMethodText = customerInfo.paymentMethod === 'cash_on_delivery' 
        ? 'Cash on Delivery' 
        : 'Credit Card (Manual Processing)';

      const paymentInstructions = customerInfo.paymentMethod === 'cash_on_delivery'
        ? 'You will pay in cash when we deliver your order.'
        : 'We will contact you shortly to process your credit card payment securely over the phone.';

      const itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${item.productName}${item.variantSize ? ` (${item.variantSize})` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₪${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₪${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
          
          ${accountCreated ? `
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2e7d32; margin: 0 0 10px 0;">🎉 Account Created!</h3>
            <p style="margin: 5px 0; color: #2e7d32;">We've automatically created an account for you with the email <strong>${customerInfo.email}</strong>.</p>
            <p style="margin: 5px 0; color: #2e7d32;">You can set your password by using the "Forgot Password" option on our login page to access your account and track future orders.</p>
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Order #${orderNumber}</h2>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${customerInfo.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethodText}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                  <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Subtotal:</span>
              <span>₪${(totalAmount - shippingCost).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Shipping:</span>
              <span>₪${shippingCost.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding-top: 10px; border-top: 1px solid #dee2e6; font-weight: bold; font-size: 18px;">
              <span>Total:</span>
              <span>₪${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin: 0 0 10px 0;">Payment Information</h3>
            <p style="margin: 0;">${paymentInstructions}</p>
          </div>

          <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #388e3c; margin: 0 0 10px 0;">What's Next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Our team will review your order within 1-2 business days</li>
              <li>We'll contact you to confirm delivery details</li>
              <li>Your order will be prepared and delivered to your location</li>
            </ol>
          </div>

          ${customerInfo.address ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Delivery Address:</h3>
            <p style="margin: 5px 0;">${customerInfo.address}</p>
            <p style="margin: 5px 0;">${customerInfo.city}, Israel</p>
          </div>
          ` : ''}

          ${customerInfo.notes ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Order Notes:</h3>
            <p style="margin: 5px 0; font-style: italic;">${customerInfo.notes}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0;"><strong>Thank you for your order!</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
      `;

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "Order Confirmation <orders@resend.dev>",
        to: [customerInfo.email],
        subject: `Order Confirmation - ${orderNumber}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error('❌ Email sending error:', emailError);
      } else {
        console.log('✅ Order confirmation email sent:', emailData?.id);
      }

      // Log email attempt
      await supabaseService.from('email_logs').insert({
        email: customerInfo.email,
        subject: `Order Confirmation - ${orderNumber}`,
        email_type: 'order_confirmation',
        status: emailError ? 'failed' : 'sent',
        order_id: order.id
      });

    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      // Don't fail the order creation if email fails
    }

    // Return success response with order details and account info
    const responseData = {
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        email: customerInfo.email,
        customer_name: customerInfo.name,
        amount: totalAmount,
        currency: 'ILS',
        status: 'pending',
        payment_gateway: customerInfo.paymentMethod,
        created_at: order.created_at,
        items: items
      },
      account_created: accountCreated
    };

    // Include session ID for guest orders (for order tracking)
    if (orderSessionId) {
      responseData.order.session_id = orderSessionId;
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Create order error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
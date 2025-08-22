import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteAccountRequest {
  confirmEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid or expired authentication token");
    }

    const user = userData.user;
    const { confirmEmail }: DeleteAccountRequest = await req.json();

    // Verify email matches
    if (confirmEmail !== user.email) {
      throw new Error("Email confirmation does not match your account email");
    }

    console.log(`🗑️ Starting account deletion for user: ${user.email}`);

    // Delete user data from related tables (in order of dependencies)
    const userId = user.id;

    // Delete user-specific cart data from localStorage (handled by frontend)
    // Delete orders and related data
    const { error: orderItemsError } = await supabaseService
      .from('order_items')
      .delete()
      .in('order_id', 
        supabaseService
          .from('orders')
          .select('id')
          .eq('user_id', userId)
      );

    const { error: ordersError } = await supabaseService
      .from('orders')
      .delete()
      .eq('user_id', userId);

    // Delete quotes
    const { error: quotesError } = await supabaseService
      .from('quotes')
      .delete()
      .eq('user_id', userId);

    // Delete chat conversations and messages
    const { error: chatMessagesError } = await supabaseService
      .from('chat_messages')
      .delete()
      .in('conversation_id', 
        supabaseService
          .from('chat_conversations')
          .select('id')
          .eq('user_id', userId)
      );

    const { error: chatConversationsError } = await supabaseService
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId);

    // Delete contact messages
    const { error: contactMessagesError } = await supabaseService
      .from('contact_messages')
      .delete()
      .eq('user_id', userId);

    // Delete user preferences
    const { error: preferencesError } = await supabaseService
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    // Delete user roles
    const { error: rolesError } = await supabaseService
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Delete profile
    const { error: profileError } = await supabaseService
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    // Delete the user from auth.users using admin API
    const { error: deleteUserError } = await supabaseService.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('❌ Error deleting user from auth:', deleteUserError);
      throw new Error(`Failed to delete user account: ${deleteUserError.message}`);
    }

    // Log any non-critical errors but don't fail the deletion
    const errors = [
      orderItemsError, ordersError, quotesError, chatMessagesError, 
      chatConversationsError, contactMessagesError, preferencesError, 
      rolesError, profileError
    ].filter(Boolean);

    if (errors.length > 0) {
      console.warn('⚠️ Some data cleanup had issues but account was deleted:', errors);
    }

    console.log(`✅ Account successfully deleted for user: ${user.email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Account successfully deleted"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Delete account error:", error);
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
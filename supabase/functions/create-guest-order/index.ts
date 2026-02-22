/// <reference path="../deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GuestOrderItem = {
  product_id: string;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  weight_grams: number;
  gold_rate_applied: number;
  making_charges: number;
  diamond_cost: number;
  stone_cost: number;
  unit_price: number;
  total_price: number;
  selected_variations?: Record<string, unknown> | null;
  variation_price_adjustment?: number;
  variation_weight_adjustment?: number;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      order_number,
      subtotal,
      gst_amount,
      total_amount,
      gold_rate_at_order,
      shipping_address,
      notes,
      payment_method,
      payment_id,
      items,
    } = await req.json();

    if (!order_number || !total_amount || !gold_rate_at_order || !shipping_address || !Array.isArray(items)) {
      throw new Error("Missing required order data");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: null,
          order_number,
          status: payment_id ? "confirmed" : "pending",
          subtotal,
          gst_amount,
          total_amount,
          gold_rate_at_order,
          shipping_address,
          payment_method,
          payment_id: payment_id || null,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = (items as GuestOrderItem[]).map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image || null,
      quantity: item.quantity,
      weight_grams: item.weight_grams,
      gold_rate_applied: item.gold_rate_applied,
      making_charges: item.making_charges,
      diamond_cost: item.diamond_cost,
      stone_cost: item.stone_cost,
      unit_price: item.unit_price,
      total_price: item.total_price,
      selected_variations: item.selected_variations || {},
      variation_price_adjustment: item.variation_price_adjustment || 0,
      variation_weight_adjustment: item.variation_weight_adjustment || 0,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return new Response(
      JSON.stringify({ success: true, order_id: order.id, order_number: order.order_number }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating guest order:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

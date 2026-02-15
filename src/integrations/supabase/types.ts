export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      category_making_charges: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          id: string
          making_charge_percent: number
          min_making_charge: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          id?: string
          making_charge_percent?: number
          min_making_charge?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          id?: string
          making_charge_percent?: number
          min_making_charge?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chit_funds: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string
          email: string | null
          id: string
          monthly_amount: number
          months_paid: number
          next_due_date: string | null
          notes: string | null
          phone: string
          plan_name: string
          start_date: string
          status: string
          total_gold_grams: number | null
          total_months: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name: string
          email?: string | null
          id?: string
          monthly_amount: number
          months_paid?: number
          next_due_date?: string | null
          notes?: string | null
          phone: string
          plan_name: string
          start_date?: string
          status?: string
          total_gold_grams?: number | null
          total_months?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string
          email?: string | null
          id?: string
          monthly_amount?: number
          months_paid?: number
          next_due_date?: string | null
          notes?: string | null
          phone?: string
          plan_name?: string
          start_date?: string
          status?: string
          total_gold_grams?: number | null
          total_months?: number
          updated_at?: string
        }
        Relationships: []
      }
      chit_payments: {
        Row: {
          amount: number
          chit_fund_id: string
          created_at: string
          created_by: string | null
          gold_grams: number
          gold_rate_applied: number
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          receipt_number: string | null
        }
        Insert: {
          amount: number
          chit_fund_id: string
          created_at?: string
          created_by?: string | null
          gold_grams: number
          gold_rate_applied: number
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
        }
        Update: {
          amount?: number
          chit_fund_id?: string
          created_at?: string
          created_by?: string | null
          gold_grams?: number
          gold_rate_applied?: number
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chit_payments_chit_fund_id_fkey"
            columns: ["chit_fund_id"]
            isOneToOne: false
            referencedRelation: "chit_funds"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          is_resolved: boolean | null
          message: string
          name: string
          phone: string
          product_id: string | null
          store_id: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_resolved?: boolean | null
          message: string
          name: string
          phone: string
          product_id?: string | null
          store_id?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          name?: string
          phone?: string
          product_id?: string | null
          store_id?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      gold_rates: {
        Row: {
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          is_current: boolean | null
          rate_18k: number | null
          rate_22k: number
          rate_24k: number
          silver_rate: number | null
          source: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_current?: boolean | null
          rate_18k?: number | null
          rate_22k: number
          rate_24k: number
          silver_rate?: number | null
          source?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_current?: boolean | null
          rate_18k?: number | null
          rate_22k?: number
          rate_24k?: number
          silver_rate?: number | null
          source?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          notification_type: string
          sent_at: string | null
          target_users: string[] | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          target_users?: string[] | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          target_users?: string[] | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          diamond_cost: number | null
          gold_rate_applied: number
          id: string
          making_charges: number
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          stone_cost: number | null
          total_price: number
          unit_price: number
          weight_grams: number
        }
        Insert: {
          diamond_cost?: number | null
          gold_rate_applied: number
          id?: string
          making_charges: number
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          stone_cost?: number | null
          total_price: number
          unit_price: number
          weight_grams: number
        }
        Update: {
          diamond_cost?: number | null
          gold_rate_applied?: number
          id?: string
          making_charges?: number
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          stone_cost?: number | null
          total_price?: number
          unit_price?: number
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          gold_rate_at_order: number
          gst_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          gold_rate_at_order: number
          gst_amount: number
          id?: string
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          gold_rate_at_order?: number
          gst_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_available: boolean | null
          is_default: boolean | null
          metal_type: Database["public"]["Enums"]["metal_type"] | null
          price_adjustment: number | null
          product_id: string
          size_label: string | null
          size_value: string | null
          sku_suffix: string | null
          stock_quantity: number | null
          updated_at: string
          variation_type: string
          weight_adjustment: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_default?: boolean | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          price_adjustment?: number | null
          product_id: string
          size_label?: string | null
          size_value?: string | null
          sku_suffix?: string | null
          stock_quantity?: number | null
          updated_at?: string
          variation_type: string
          weight_adjustment?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_default?: boolean | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          price_adjustment?: number | null
          product_id?: string
          size_label?: string | null
          size_value?: string | null
          sku_suffix?: string | null
          stock_quantity?: number | null
          updated_at?: string
          variation_type?: string
          weight_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          diamond_cost: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_bestseller: boolean | null
          is_bridal: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          low_stock_threshold: number | null
          making_charge_percent: number | null
          metal_type: Database["public"]["Enums"]["metal_type"]
          name: string
          short_description: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number | null
          stone_cost: number | null
          tags: string[] | null
          updated_at: string
          video_url: string | null
          weight_grams: number
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          diamond_cost?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_bridal?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          low_stock_threshold?: number | null
          making_charge_percent?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          name: string
          short_description?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number | null
          stone_cost?: number | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          weight_grams: number
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          diamond_cost?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_bridal?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          low_stock_threshold?: number | null
          making_charge_percent?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          name?: string
          short_description?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number | null
          stone_cost?: number | null
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          weight_grams?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          order_updates: boolean
          p256dh: string
          promo_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          order_updates?: boolean
          p256dh: string
          promo_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          order_updates?: boolean
          p256dh?: string
          promo_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_published: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_published?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_published?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          pincode: string
          state: string
          timings: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          pincode: string
          state: string
          timings?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          pincode?: string
          state?: string
          timings?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      low_stock_products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"] | null
          id: string | null
          is_active: boolean | null
          low_stock_threshold: number | null
          name: string | null
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["product_category"] | null
          id?: string | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string | null
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"] | null
          id?: string | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string | null
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_product_price: {
        Args: {
          p_diamond_cost?: number
          p_making_charge_percent: number
          p_metal_type: Database["public"]["Enums"]["metal_type"]
          p_stone_cost?: number
          p_weight: number
        }
        Returns: {
          gold_value: number
          gst: number
          making_charges: number
          subtotal: number
          total: number
        }[]
      }
      get_current_gold_rate: {
        Args: never
        Returns: {
          effective_date: string
          rate_18k: number
          rate_22k: number
          rate_24k: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      metal_type: "gold_22k" | "gold_24k" | "gold_18k" | "silver" | "platinum"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_category:
        | "necklaces"
        | "earrings"
        | "rings"
        | "bangles"
        | "bracelets"
        | "chains"
        | "pendants"
        | "wedding_sets"
        | "diamond_jewellery"
        | "mens_jewellery"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      metal_type: ["gold_22k", "gold_24k", "gold_18k", "silver", "platinum"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_category: [
        "necklaces",
        "earrings",
        "rings",
        "bangles",
        "bracelets",
        "chains",
        "pendants",
        "wedding_sets",
        "diamond_jewellery",
        "mens_jewellery",
      ],
    },
  },
} as const

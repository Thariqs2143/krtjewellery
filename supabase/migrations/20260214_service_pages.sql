-- Create service_pages table for storing editable service page content
CREATE TABLE public.service_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT UNIQUE NOT NULL,
  page_title TEXT NOT NULL,
  page_subtitle TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  hero_badge TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view service pages
CREATE POLICY "Anyone can view service pages" ON public.service_pages
  FOR SELECT USING (true);

-- Only admins can update service pages
CREATE POLICY "Admins can update service pages" ON public.service_pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Insert default service pages
INSERT INTO public.service_pages (page_slug, page_title, page_subtitle, hero_description, hero_badge, content)
VALUES 
  (
    'returns-exchange',
    '15-Day Returns & Exchanges',
    'Peace of Mind',
    'Not happy with your purchase? Exchange or return within 15 days for a full refund or exchange.',
    'Peace of Mind',
    '{
      "features": [
        {"icon": "clock", "title": "15 Days", "description": "Full return or exchange window from the date of delivery"},
        {"icon": "package", "title": "Free Shipping", "description": "Complimentary pickup and delivery for returns and exchanges"},
        {"icon": "shield", "title": "No Questions", "description": "Hassle-free process. We don'"'"'t ask why - just make it right"}
      ],
      "process": [
        {"step": 1, "title": "Initiate Return", "desc": "Contact our support team or use your account"},
        {"step": 2, "title": "Schedule Pickup", "desc": "We arrange free pickup from your location"},
        {"step": 3, "title": "Inspection", "desc": "We inspect and verify the item condition"},
        {"step": 4, "title": "Refund/Exchange", "desc": "Get refund or exchange within 5-7 days"}
      ],
      "eligible": [
        "Within 15 days from delivery",
        "Original packaging and tags intact",
        "No visible signs of wear",
        "Includes certificate of authenticity",
        "All accessories included"
      ],
      "notEligible": [
        "Beyond 15 days from delivery",
        "Signs of wear or damage",
        "Custom or personalized items",
        "Missing certificate or accessories",
        "Damaged packaging"
      ]
    }'
  ),
  (
    'resize-repair',
    'Resize & Repair',
    'Expert Craftsmanship',
    'Professional resizing and repair services to keep your jewelry looking perfect for generations to come.',
    'Expert Craftsmanship',
    '{
      "services": [
        {
          "icon": "wrench",
          "title": "Ring Resizing",
          "description": "Professional ring resizing service to ensure the perfect fit for your precious jewelry.",
          "features": [
            "Size adjustments up or down",
            "Expert craftsmen",
            "Maintains purity & quality",
            "Fast turnaround (7-10 days)"
          ],
          "price": "Starting ₹500"
        },
        {
          "icon": "zap",
          "title": "General Repair",
          "description": "Comprehensive repair services for all types of jewelry damage and wear.",
          "features": [
            "Prong resetting & tightening",
            "Stone replacement",
            "Chain & clasps repair",
            "Re-polishing & coating"
          ],
          "price": "Starting ₹1,000"
        }
      ],
      "process": [
        {"step": 1, "title": "Assessment", "desc": "We evaluate the damage and provide quotation"},
        {"step": 2, "title": "Approval", "desc": "You approve the repair plan and cost"},
        {"step": 3, "title": "Execution", "desc": "Expert craftsmen complete the repair work"},
        {"step": 4, "title": "Quality Check", "desc": "Final inspection before delivery to you"}
      ],
      "repairTypes": [
        "Ring Resizing", "Prong Resetting", "Stone Replacement", "Chain Repairs",
        "Bracelet Repairs", "Clasp Replacement", "Re-polishing", "Re-coating",
        "Stone Tightening", "Soldering", "Rhodium Plating", "Cleaning & Polishing"
      ]
    }'
  ),
  (
    'lifetime-exchange',
    'Lifetime Exchange & Buyback',
    'Forever Value',
    'Exchange your jewelry for new designs anytime or sell it back. Your gold always has value with KRT Jewels.',
    'Forever Value',
    '{
      "exchange": {
        "icon": "gift",
        "title": "Lifetime Exchange",
        "description": "Exchange your jewelry for any new design from our collections. Your piece always maintains its value.",
        "features": [
          "Exchange anytime, anywhere",
          "100% gold value credited",
          "No deductions on making charges",
          "Upgrade to larger designs",
          "Updated hallmark applies"
        ]
      },
      "buyback": {
        "icon": "trending-up",
        "title": "Buyback Program",
        "description": "Sell your jewelry back to us at competitive rates. Your gold always has intrinsic value.",
        "features": [
          "Best buyback rates guaranteed",
          "Instant appraisal & payment",
          "Paid by stone weight + purity",
          "No hidden charges",
          "Transparent pricing"
        ]
      },
      "why": [
        {"icon": "award", "title": "30+ Years Trust", "desc": "Established jewelry brand with proven track record"},
        {"icon": "shield", "title": "BIS Hallmarked", "desc": "916 gold purity guaranteed on all purchases"},
        {"icon": "trending-up", "title": "Live Gold Rates", "desc": "Fair valuation based on current market rates"}
      ],
      "exchangeProcess": [
        {"step": 1, "title": "Bring Item", "desc": "Visit store with your jewelry"},
        {"step": 2, "title": "Verification", "desc": "We verify purity and quality"},
        {"step": 3, "title": "Select New", "desc": "Choose from new designs"},
        {"step": 4, "title": "Exchange", "desc": "Get new piece instantly"}
      ],
      "buybackProcess": [
        {"step": 1, "title": "Appraisal", "desc": "Quick assessment of item"},
        {"step": 2, "title": "Weighing", "desc": "Precise weight calculation"},
        {"step": 3, "title": "Quotation", "desc": "Fair price quote based on rate"},
        {"step": 4, "title": "Payment", "desc": "Instant payment methods"}
      ]
    }'
  )
ON CONFLICT (page_slug) DO NOTHING;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_service_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_pages_updated_at
  BEFORE UPDATE ON public.service_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_service_pages_updated_at();

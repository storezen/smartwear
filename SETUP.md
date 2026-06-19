# Smartwear Store - Complete Setup Guide

Yeh aapka custom Smartwear (Smart Watches + Analog Watches + Accessories) store hai.

**Features jo ab ready hain:**
- Premium UI/UX (elegant, modern, mobile-friendly)
- TikTok Pixel fully integrated with key events (ViewContent, AddToCart, InitiateCheckout, Purchase with value in PKR)
- Real Supabase backend (products load from DB, orders save in DB)
- Simple Admin panel: Products add/edit/delete + Orders view + status update
- Easy event testing

---

## Step 1: Supabase Setup (Backend)

1. Jaao https://supabase.com aur free account banao.
2. New Project create karo (name: smartwear ya jo chaaho).
3. Project ready hone ke baad:
   - Left sidebar mein **SQL Editor** pe click karo.
   - `supabase/schema.sql` file ka pura content copy-paste karke **Run** karo.
   - Phir `supabase/seed.sql` ka pura content copy-paste karke **Run** karo.

Yeh products table aur orders table bana dega + sample Smartwear data daal dega.

---

## Step 2: Environment Variables

Project root mein `.env.local` file banao (agar nahi hai) aur ye daalo:

```env
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_tiktok_pixel_id_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**TikTok Pixel ID** kahan se milega:
- TikTok Ads Manager → Events Manager → apna Pixel choose karo → Pixel ID copy.

**Supabase values** kahan se milega:
- Supabase Dashboard → Settings (gear icon) → API
- Copy "Project URL" aur "anon public" key.

---

## Step 3: Local Development

```bash
pnpm install
pnpm dev
```

- Store dekho: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login
- Admin Dashboard: http://localhost:3000/admin (after login)
- Event testing: http://localhost:3000/test-events

---

## Step 4: Deployment on Vercel (Recommended)

1. Code ko GitHub pe push kar do (agar nahi kiya).

2. Jaao https://vercel.com aur apne GitHub account se sign in karo.

3. **Add New Project** → apna repo select karo.

4. **Environment Variables** section mein ye teen variables add karo (production ke liye):
   - `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (Values wahi daalo jo `.env.local` mein hain)

5. **Deploy** click karo.

Deployment ke baad aapko live URL milega (jaise `smartwear.vercel.app`).

---

## Step 5: TikTok Ads + Event Testing (Sabse Important)

### Real Events Test Karne Ka Tarika:

**Option A (Sabse Easy):**
1. Apne deployed site pe jaao.
2. `/test-events` page kholo (example: `https://your-site.vercel.app/test-events`)
3. TikTok Events Manager → Test Events kholo (Ads Manager mein).
4. Buttons dabaao (ViewContent, AddToCart, Purchase etc.).
5. Events real-time dikhne lagenge.

**Option B (Real Store Flow):**
1. Product page kholo → ViewContent fire hoga.
2. Add to Cart → AddToCart fire hoga.
3. Checkout pe jaao → InitiateCheckout fire hoga.
4. Order place karo → Purchase (with actual price in PKR) fire hoga.

**Browser Console Check:**
DevTools → Console mein `[TikTok Pixel]` logs dekh sakte ho.

Jab events sahi se aa rahe hon, tab apne TikTok ads mein ye Pixel attach karo aur optimization "Purchase" pe set karo.

---

## Admin Panel Use Kaise Karein

- `/admin` pe jaao
- **Products**: Naye watches add karo, edit karo, stock update karo, hide karo.
- **Orders**: Real customer orders dekho aur status badlo (pending → confirmed → shipped etc.).

**Admin Login:**
- Username: `admin`
- Password: `smartwear123`

Admin ab protected hai (localStorage based simple auth). Login page: `/admin/login`

---

## Important Files

- `supabase/schema.sql` + `supabase/seed.sql` → Database structure
- `lib/supabase.ts` → Backend connection
- `lib/tiktok-pixel.ts` → TikTok events logic (with full testing instructions inside)
- `app/(store)/test-events/page.tsx` → Easy manual event testing

---

## Next Possible Improvements (Agar Chahiye)

- Admin ko password protect karna
- Real customer login + order history
- Better image upload (abhi URL daalna padta hai)
- Email notifications on order
- Payment gateway (JazzCash / Easypaisa / COD confirmation flow)
- Vercel pe custom domain lagana

Batao kya chahiye aage!

---

## Quick Links (Live Site pe)

- Home: /
- Collection: /products
- Test Events: /test-events
- Track Order: /track-order
- Admin: /admin

---

**Sab kuch simple rakhne ki koshish ki hai.** 

Agar koi step mein atak jaao to screenshot bhej dena ya exact error bata dena. Main turant help karunga. 

Ab aap apna TikTok ads chala sakte ho is pixel ke saath! 🔥

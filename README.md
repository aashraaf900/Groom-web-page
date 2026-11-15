# Marriage Biodata — Supabase + GitHub Pages

A responsive Bengali marriage biodata demo with:
- Public, read-only biodata view
- Admin email/password login
- Edit personal details, education, addresses and photo
- Add/remove custom extra sections with your own titles
- Publish/unpublish control
- Supabase Postgres, Auth, Storage and Row Level Security

## 1. Create Supabase project
1. Create a project at https://supabase.com/
2. Open **SQL Editor**, paste `supabase-setup.sql`, and run it.
3. Go to **Project Settings → API** (or API Keys) and copy the Project URL and `anon` / publishable key.
4. Open `app.js` and replace:
   - `YOUR_SUPABASE_URL`
   - `YOUR_SUPABASE_ANON_KEY`

The anon/publishable key is intended for browser use. **Never put the `service_role` / secret key in this website or GitHub.**

## 2. Create an Admin account
1. In Supabase Dashboard open **Authentication → Users**.
2. Add a user with the admin email and a strong password (or enable sign-up temporarily and create it).
3. Keep public sign-up disabled after creating your admin account.
4. Admin login is available from the website's **Admin Login** button.

The database policies allow any authenticated account to manage only its own biodata row. For a single-admin site, create only your own admin account and keep sign-up disabled. If you later add multiple accounts, add an explicit role/authorization layer before allowing more people to administer data.

## 3. Run locally
You can open `index.html` for a quick preview. For a local web server, from this folder run:
```bash
python -m http.server 8000
```
Then open http://localhost:8000

## 4. Publish on GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and `supabase-setup.sql` (README optional).
3. In **Settings → Pages**, deploy from your main branch and root folder.
4. Open the published URL.

## 5. Important privacy notes
- Anything shown in the public view is readable by anyone on the internet. Publish only information the adult profile owner has chosen to share.
- Avoid publishing phone numbers, exact home addresses, identity numbers, financial details, or other sensitive information.
- The current demo shows the present/permanent address fields publicly. If you do not want exact addresses exposed, enter only a general area (for example, district/city) or remove those fields from the public renderer.
- Profile photos are in a public Storage bucket so the public page can display them. Use a photo you have permission to share.
- This is a starter demo, not a complete production security audit. Use strong admin credentials and keep Supabase project access secure.

## Data structure
The main `biodata` row stores:
- `personal` — JSON object for profile and address fields
- `education` — JSON array of education entries
- `extras` — JSON array of `{ "title": "...", "content": "..." }`
- `photo_url`, `is_published`, `owner_id`, `updated_at`

## Customization
Change colors and layout in `style.css`. Add fields to the form and `getFormData()` / `fillForm()` in `app.js` if you need more fixed fields. Extra sections can already be added dynamically with a custom title.

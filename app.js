// 1) Supabase project settings বসান
const SUPABASE_URL = "https://cszliqgdjmpeqveuomna.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OAUugMZbaw0xNjWTjwQy3g_FBIrQX8e";
const supabaseReady = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const TABLE = "biodata";
const BUCKET = "biodata-photos";
let currentRecord = null;
let selectedPhoto = null;

const $ = (id) => document.getElementById(id);
const show = (id, yes=true) => $(id).classList.toggle("hidden", !yes);
const clean = (value) => (value || "").trim();

function addEducation(data={}) {
  const wrap = document.createElement("div");
  wrap.className = "dynamic-item education-row";
  wrap.innerHTML = `<button type="button" class="remove" aria-label="Remove">মুছুন</button>
    <div class="form-grid">
      <label>ডিগ্রি / পরীক্ষার নাম<input class="degree" placeholder="যেমন: B.Sc" value=""></label>
      <label>প্রতিষ্ঠান<input class="institution" placeholder="প্রতিষ্ঠানের নাম" value=""></label>
      <label>বিষয় / বিভাগ<input class="subject" placeholder="বিষয়" value=""></label>
      <label>পাসের বছর<input class="year" placeholder="বছর" value=""></label>
    </div>`;
  wrap.querySelector(".degree").value = data.degree || "";
  wrap.querySelector(".institution").value = data.institution || "";
  wrap.querySelector(".subject").value = data.subject || "";
  wrap.querySelector(".year").value = data.year || "";
  wrap.querySelector(".remove").onclick = () => wrap.remove();
  $("educationFields").appendChild(wrap);
}
function addExtra(data={}) {
  const wrap = document.createElement("div");
  wrap.className = "dynamic-item extra-row";
  wrap.innerHTML = `<button type="button" class="remove" aria-label="Remove">মুছুন</button>
    <label>Section Title<input class="extra-title" placeholder="যেমন: Family Information"></label>
    <label>বিস্তারিত<textarea class="extra-content" placeholder="এখানে তথ্য লিখুন..."></textarea></label>`;
  wrap.querySelector(".extra-title").value = data.title || "";
  wrap.querySelector(".extra-content").value = data.content || "";
  wrap.querySelector(".remove").onclick = () => wrap.remove();
  $("extraFields").appendChild(wrap);
}
function getFormData() {
  const personal = {};
  ["full_name","date_of_birth","height","marital_status","profession","religion","present_address","permanent_address"].forEach(id => personal[id] = clean($(id).value));
  const education = [...document.querySelectorAll(".education-row")].map(row => ({
    degree: clean(row.querySelector(".degree").value),
    institution: clean(row.querySelector(".institution").value),
    subject: clean(row.querySelector(".subject").value),
    year: clean(row.querySelector(".year").value)
  })).filter(x => Object.values(x).some(Boolean));
  const extras = [...document.querySelectorAll(".extra-row")].map(row => ({
    title: clean(row.querySelector(".extra-title").value),
    content: clean(row.querySelector(".extra-content").value)
  })).filter(x => x.title && x.content);
  return { personal, education, extras };
}
function fillForm(record) {
  const p = record?.personal || {};
  ["full_name","date_of_birth","height","marital_status","profession","religion","present_address","permanent_address"].forEach(id => $(id).value = p[id] || "");
  $("published").checked = !!record?.is_published;
  $("educationFields").innerHTML = "";
  $("extraFields").innerHTML = "";
  (record?.education || []).forEach(addEducation);
  (record?.extras || []).forEach(addExtra);
  if (!record?.education?.length) addEducation();
  if (!record?.extras?.length) addExtra();
  $("photoPreview").src = record?.photo_url || "https://placehold.co/160x190/f0eee7/66736d?text=Photo";
  selectedPhoto = null;
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function infoItem(label, value) {
  if (!value) return "";
  return `<div class="info-item"><span class="info-label">${escapeHtml(label)}</span><div class="info-value">${escapeHtml(value)}</div></div>`;
}
function renderPublic(record) {
  if (!record || !record.is_published) {
    $("profileContent").innerHTML = `<div class="profile-card"><h2 class="card-heading">বায়োডাটা এখনো প্রকাশ করা হয়নি</h2><p class="muted">Admin প্রকাশ করলে এখানে তথ্য দেখা যাবে।</p></div>`;
    return;
  }
  const p = record.personal || {};
  const photo = record.photo_url || "https://placehold.co/160x190/f0eee7/66736d?text=Photo";
  let html = `<article class="profile-card"><div class="profile-top"><img class="profile-photo" src="${escapeHtml(photo)}" alt="Profile photo"><div><p class="eyebrow">PERSONAL PROFILE</p><h2 class="profile-name">${escapeHtml(p.full_name || "নাম উল্লেখ করা হয়নি")}</h2>
    ${p.profession ? `<p class="profile-meta">${escapeHtml(p.profession)}</p>` : ""}
    ${p.marital_status ? `<p class="profile-meta">${escapeHtml(p.marital_status)}</p>` : ""}</div></div></article>`;
  const personalItems = [
    ["জন্ম তারিখ",p.date_of_birth],["উচ্চতা",p.height],["বৈবাহিক অবস্থা",p.marital_status],["পেশা",p.profession],["ধর্ম",p.religion]
  ].map(x=>infoItem(...x)).join("");
  if (personalItems) html += `<article class="profile-card"><h3 class="card-heading">Personal Information</h3><div class="info-grid">${personalItems}</div></article>`;
  if (record.education?.length) html += `<article class="profile-card"><h3 class="card-heading">Educational Qualification</h3>${record.education.map(e=>`<div class="education-item"><strong>${escapeHtml(e.degree)}</strong><div class="profile-meta">${escapeHtml(e.institution)}</div><div class="profile-meta">${escapeHtml([e.subject,e.year].filter(Boolean).join(" • "))}</div></div>`).join("")}</article>`;
  const addresses = [infoItem("বর্তমান ঠিকানা",p.present_address),infoItem("স্থায়ী ঠিকানা",p.permanent_address)].join("");
  if (addresses) html += `<article class="profile-card"><h3 class="card-heading">Address Information</h3><div class="info-grid">${addresses}</div></article>`;
  (record.extras || []).forEach(x => { html += `<article class="profile-card"><h3 class="card-heading">${escapeHtml(x.title)}</h3><div class="extra-body">${escapeHtml(x.content)}</div></article>`; });
  $("profileContent").innerHTML = html;
}
async function loadPublic() {
  if (!db) { $("profileContent").innerHTML = `<div class="profile-card"><h3>Supabase configuration প্রয়োজন</h3><p class="muted">app.js ফাইলে Project URL ও anon key বসিয়ে SQL setup চালান।</p></div>`; return; }
  const {data,error} = await db.from(TABLE).select("*").eq("is_published",true).limit(1).maybeSingle();
  if (error) { $("profileContent").innerHTML = `<div class="profile-card">তথ্য লোড করা যায়নি। Supabase SQL ও RLS policy পরীক্ষা করুন।</div>`; return; }
  renderPublic(data);
}
async function loadAdmin() {
  const {data:{user}} = await db.auth.getUser();
  if (!user) { show("loginCard"); show("editor",false); show("logoutBtn",false); return; }
  show("loginCard",false); show("editor"); show("logoutBtn");
  const {data,error} = await db.from(TABLE).select("*").limit(1).maybeSingle();
  if (error) { $("saveMessage").textContent = "ডেটা পড়া যায়নি: " + error.message; return; }
  currentRecord = data;
  fillForm(data || {});
}
async function uploadPhoto() {
  if (!selectedPhoto) return currentRecord?.photo_url || null;
  if (selectedPhoto.size > 5*1024*1024) throw new Error("ছবির সাইজ 5 MB-এর বেশি হতে পারবে না।");
  const ext = selectedPhoto.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
  const path = `${(await db.auth.getUser()).data.user.id}/profile-${Date.now()}.${ext}`;
  const {error} = await db.storage.from(BUCKET).upload(path,selectedPhoto,{upsert:true,contentType:selectedPhoto.type});
  if (error) throw error;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
async function saveBiodata(event) {
  event.preventDefault();
  $("saveMessage").textContent = "সংরক্ষণ হচ্ছে...";
  try {
    const photo_url = await uploadPhoto();
    const payload = {...getFormData(), photo_url, is_published:$("published").checked, updated_at:new Date().toISOString()};
    const {data:{user}} = await db.auth.getUser();
    const {data,error} = await db.from(TABLE).upsert({...payload, owner_id:user.id},{onConflict:"owner_id"}).select().single();
    if (error) throw error;
    currentRecord = data;
    $("saveMessage").textContent = "সফলভাবে সংরক্ষণ হয়েছে।";
    loadPublic();
  } catch(error) { $("saveMessage").textContent = "সমস্যা: " + error.message; }
}
$("viewProfileBtn").onclick = () => { show("publicView"); show("adminView",false); $("viewProfileBtn").classList.add("active"); $("adminOpenBtn").classList.remove("active"); loadPublic(); };
$("adminOpenBtn").onclick = () => { show("publicView",false); show("adminView"); $("viewProfileBtn").classList.remove("active"); $("adminOpenBtn").classList.add("active"); if(db) loadAdmin(); };
$("addEducation").onclick = () => addEducation();
$("addExtra").onclick = () => addExtra();
$("photoFile").onchange = (e) => { selectedPhoto=e.target.files[0] || null; if(selectedPhoto) $("photoPreview").src=URL.createObjectURL(selectedPhoto); };
$("loginForm").onsubmit = async (e) => {
  e.preventDefault(); if(!db) return;
  $("loginMessage").textContent = "Login হচ্ছে...";
  const {error} = await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});
  $("loginMessage").textContent = error ? error.message : "Login সফল।";
  if(!error) loadAdmin();
};
$("logoutBtn").onclick = async () => { await db.auth.signOut(); loadAdmin(); };
$("biodataForm").onsubmit = saveBiodata;
if (db) db.auth.onAuthStateChange((_event) => { if (!$("adminView").classList.contains("hidden")) loadAdmin(); });
loadPublic();

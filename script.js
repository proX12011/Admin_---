import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8UmPkL9-AgrlPRPERwkYJ5uzTYX1fmDY",
  authDomain: "test-yourself-6afaa.firebaseapp.com",
  databaseURL: "https://test-yourself-6afaa-default-rtdb.firebaseio.com",
  projectId: "test-yourself-6afaa",
  storageBucket: "test-yourself-6afaa.firebasestorage.app",
  messagingSenderId: "886218676173",
  appId: "1:886218676173:web:6000c95948433e89d1d684"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// تبويبات
const tabTeachersBtn = document.getElementById("tabTeachers");
const tabPostsBtn = document.getElementById("tabPosts");
const teachersSection = document.getElementById("teachersSection");
const postsSection = document.getElementById("postsSection");

tabTeachersBtn.addEventListener("click", () => {
  teachersSection.style.display = "block";
  postsSection.style.display = "none";
});
tabPostsBtn.addEventListener("click", () => {
  teachersSection.style.display = "none";
  postsSection.style.display = "block";
});

// عناصر الموقع
const logoUrlInput = document.getElementById("logoUrl");
const saveLogoBtn = document.getElementById("saveLogo");
const siteNameInput = document.getElementById("siteName");
const siteLocationInput = document.getElementById("siteLocation");
const phoneInput = document.getElementById("phoneNumber");
const whatsappInput = document.getElementById("whatsappNumber");
const saveSiteInfoBtn = document.getElementById("saveSiteInfo");

// روابط التواصل
const socialName = document.getElementById("socialName");
const socialImage = document.getElementById("socialImage");
const socialLink = document.getElementById("socialLink");
const addSocialBtn = document.getElementById("addSocial");
const socialList = document.getElementById("socialList");

// عناصر المعلمين
const nameInput = document.getElementById("name");
const subjectInput = document.getElementById("subject");
const gradeInput = document.getElementById("grade");
const imageInput = document.getElementById("image");
const ratingInput = document.getElementById("rating");
const addTeacherBtn = document.getElementById("addTeacher");
const teachersDiv = document.getElementById("teachers");

// عناصر المنشورات
const postForm = document.getElementById("postForm");
const postsList = document.getElementById("postsList");
const statusMsg = document.getElementById("statusMsg");

// Firebase References
const settingsRef = ref(db, "settings");
const socialsRef = ref(db, "socials");
const teachersRef = ref(db, "teachers");
const postsRef = ref(db, "posts");

// ===== حفظ الشعار =====
saveLogoBtn.addEventListener("click", async () => {
  const url = logoUrlInput.value.trim();
  if(!url) return alert("أدخل رابط الشعار!");
  await set(ref(db, "settings/logo"), url);
  alert("✅ تم حفظ الشعار");
  logoUrlInput.value = "";
});

// حفظ معلومات الموقع + الهاتف والواتس
saveSiteInfoBtn.addEventListener("click", async () => {
  const name = siteNameInput.value.trim();
  const location = siteLocationInput.value.trim();
  const phone = phoneInput.value.trim();
  const whatsapp = whatsappInput.value.trim();

  if(!location) return alert("أدخل الموقع الجغرافي!");
  await set(ref(db, "settings/siteInfo"), { name, location, phone, whatsapp });
  alert("✅ تم حفظ معلومات الموقع!");
  siteNameInput.value = siteLocationInput.value = phoneInput.value = whatsappInput.value = "";
});

// عرض معلومات الموقع عند الفتح
onValue(ref(db, "settings/siteInfo"), snapshot => {
  if(snapshot.exists()) {
    const data = snapshot.val();
    siteNameInput.value = data.name || "";
    siteLocationInput.value = data.location || "";
    phoneInput.value = data.phone || "";
    whatsappInput.value = data.whatsapp || "";
  }
});

// ===== روابط التواصل =====
addSocialBtn.addEventListener("click", async () => {
  const n = socialName.value.trim();
  const i = socialImage.value.trim();
  const l = socialLink.value.trim();
  if(!n || !l) return alert("يرجى إدخال الاسم والرابط!");
  await push(socialsRef, { name: n, image: i || "", link: l });
  alert("✅ تم إضافة الرابط!");
  socialName.value = socialImage.value = socialLink.value = "";
});

onValue(socialsRef, (snap) => {
  const data = snap.val();
  socialList.innerHTML = "";
  if(data){
    Object.entries(data).forEach(([id, soc]) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <img src="${soc.image || 'https://via.placeholder.com/24'}" width="24" height="24" style="vertical-align:middle;border-radius:50%">
        <b>${soc.name}</b> - <a href="${soc.link}" target="_blank">${soc.link}</a>
        <button data-id="${id}" class="delete-social">🗑️</button>
      `;
      socialList.appendChild(div);
    });

    document.querySelectorAll(".delete-social").forEach(btn => {
      btn.addEventListener("click", async () => {
        if(confirm("هل تريد حذف هذا الرابط؟")){
          await remove(ref(db, "socials/"+btn.dataset.id));
        }
      });
    });

  } else {
    socialList.innerHTML = "<p>لا توجد روابط بعد.</p>";
  }
});

// ===== المعلمين =====
addTeacherBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const subject = subjectInput.value.trim();
  const grade = gradeInput.value.trim();
  const image = imageInput.value.trim();
  const rating = ratingInput.value.trim();

  if(!name || !subject || !grade) return alert("يرجى ملء جميع الحقول المطلوبة.");
  await push(teachersRef, { name, subject, grade, image, rating: rating || "5" });
  alert("✅ تم إضافة المعلم بنجاح!");
  nameInput.value = subjectInput.value = gradeInput.value = imageInput.value = ratingInput.value = "";
});

// عرض وحذف المعلمين + نسخ ID
onValue(teachersRef, snapshot => {
  teachersDiv.innerHTML = "";
  const data = snapshot.val();
  if(data){
    Object.entries(data).forEach(([id, teacher]) => {
      const div = document.createElement("div");
      div.classList.add("teacher-card");
      div.innerHTML = `
        <img src="${teacher.image || 'https://via.placeholder.com/200'}">
        <h3>${teacher.name}</h3>
        <p>${teacher.subject} - ${teacher.grade}</p>
        <p>⭐ ${teacher.rating || '5'}</p>
        <div class="teacher-id-box">
          <span class="teacher-id">🆔 <b>${id}</b></span>
          <button class="copy-id" data-id="${id}">📋 نسخ ID</button>
        </div>
        <button class="delete-btn" data-id="${id}">🗑️ حذف</button>
      `;
      teachersDiv.appendChild(div);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if(confirm("هل تريد حذف هذا المعلم؟")){
          await remove(ref(db, "teachers/"+btn.dataset.id));
        }
      });
    });

    document.querySelectorAll(".copy-id").forEach(btn => {
      btn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(btn.dataset.id);
        alert("✅ تم نسخ الـ ID: "+btn.dataset.id);
      });
    });

  } else {
    teachersDiv.innerHTML = "<p>لا يوجد معلمون بعد.</p>";
  }
});

// ===== المنشورات =====
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: title.value.trim(),
    teacherId: teacherId.value.trim(),
    content: content.value.trim(),
    type: type.value,
    fileUrl: fileUrl.value.trim(),
    timestamp: Date.now()
  };
  const newPostRef = push(postsRef);
  await set(newPostRef, data);
  statusMsg.textContent = "✅ تم إضافة المنشور";
  statusMsg.style.color = "lime";
  postForm.reset();
});

onValue(postsRef, snapshot => {
  postsList.innerHTML = "";
  const posts = snapshot.val();
  if(!posts){ postsList.innerHTML="<p>لا توجد منشورات</p>"; return; }

  Object.keys(posts).forEach(id => {
    const p = posts[id];
    const div = document.createElement("div");
    div.className = "post-item";
    div.innerHTML = `
      <h3>${p.title}</h3>
      <p><strong>المعلم:</strong> ${p.teacherId}</p>
      <p><strong>النوع:</strong> ${p.type}</p>
      <p><strong>النص:</strong> ${p.content || "لا يوجد"}</p>
      <p><strong>الرابط:</strong> ${p.fileUrl ? `<a href="${p.fileUrl}" target="_blank">عرض الملف</a>`:"لا يوجد"}</p>
      <button class="edit-btn">✏️ تعديل</button>
      <button class="delete-btn">🗑️ حذف</button>
    `;
    div.querySelector(".delete-btn").onclick = () => {
      if(confirm("هل تريد حذف المنشور؟")) remove(ref(db,"posts/"+id));
    };
    div.querySelector(".edit-btn").onclick = () => {
      const newTitle = prompt("عنوان جديد:", p.title);
      const newContent = prompt("نص جديد:", p.content);
      const newUrl = prompt("رابط جديد:", p.fileUrl);
      update(ref(db,"posts/"+id), { title:newTitle||p.title, content:newContent||p.content, fileUrl:newUrl||p.fileUrl });
      alert("✅ تم التعديل");
    };
    postsList.appendChild(div);
  });
});

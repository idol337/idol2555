import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// -----------------------
// Firebase Config
// -----------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------
// App Component
// -----------------------
export default function App() {
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(0);
  const [newPromo, setNewPromo] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [menu, setMenu] = useState("stock");

  // โหลดสินค้า
  async function loadItems() {
    const snap = await getDocs(collection(db, "products"));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  // โหลดโปรโมชั่น
  async function loadPromotions() {
    const snap = await getDocs(collection(db, "promotions"));
    setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => {
    if (accessGranted) {
      loadItems();
      loadPromotions();
    }
  }, [accessGranted]);

  // เพิ่มสินค้า
  async function addItem(e) {
    e.preventDefault();
    if (!newItemName || newItemQty <= 0) return;
    await addDoc(collection(db, "products"), {
      name: newItemName,
      quantity: Number(newItemQty),
    });
    setNewItemName("");
    setNewItemQty(0);
    await loadItems();
  }

  // ปรับจำนวนสินค้า
  async function updateQuantity(id, currentQty, change) {
    const ref = doc(db, "products", id);
    await updateDoc(ref, { quantity: currentQty + change });
    await loadItems();
  }

  // เพิ่มโปรโมชั่น
  async function addPromotion(e) {
    e.preventDefault();
    if (!newPromo) return;
    await addDoc(collection(db, "promotions"), {
      text: newPromo,
    });
    setNewPromo("");
    await loadPromotions();
  }

  // ลบโปรโมชั่น
  async function deletePromotion(id) {
    await deleteDoc(doc(db, "promotions", id));
    await loadPromotions();
  }

  // ตรวจสอบโค้ดเข้าเว็บ
  function checkCode() {
    if (codeInput === "idol" || codeInput === "Thir") {
      setAccessGranted(true);
    } else {
      alert("โค้ดไม่ถูกต้อง!");
    }
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100 p-6">
        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4">ใส่โค้ดเพื่อเข้าเว็บ</h2>
          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="กรอกโค้ด"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <button
            onClick={checkCode}
            className="w-full py-2 bg-green-600 text-white rounded"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* เมนู */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMenu("stock")}
          className={`flex-1 py-2 rounded ${menu === "stock" ? "bg-green-600 text-white" : "bg-white shadow"}`}
        >
          สต็อกสินค้า
        </button>
        <button
          onClick={() => setMenu("promo")}
          className={`flex-1 py-2 rounded ${menu === "promo" ? "bg-green-600 text-white" : "bg-white shadow"}`}
        >
          โปรโมชั่น
        </button>
      </div>

      {/* หน้าสต็อก */}
      {menu === "stock" && (
        <>
          <h1 className="text-2xl font-bold mb-4">สต็อกสินค้า</h1>
          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="ชื่อสินค้า"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input
              className="w-24 p-2 border rounded"
              type="number"
              placeholder="จำนวน"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
            />
            <button className="px-4 py-2 bg-green-600 text-white rounded">
              เพิ่มสินค้า
            </button>
          </form>

          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="p-4 bg-white rounded shadow flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{item.name}</span> — เหลือ {item.quantity}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 0}
                    className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity, 1)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* หน้าจัดการโปรโมชั่น */}
      {menu === "promo" && (
        <>
          <h1 className="text-2xl font-bold mb-4">โปรโมชั่น</h1>
          <form onSubmit={addPromotion} className="flex gap-2 mb-6">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="รายละเอียดโปรโมชั่น"
              value={newPromo}
              onChange={(e) => setNewPromo(e.target.value)}
            />
            <button className="px-4 py-2 bg-green-600 text-white rounded">
              เพิ่ม
            </button>
          </form>

          <ul className="space-y-3">
            {promotions.map((p) => (
              <li
                key={p.id}
                className="p-4 bg-white rounded shadow flex justify-between items-center"
              >
                <div>{p.text}</div>
                <button
                  onClick={() => deletePromotion(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/*
=========================
README (วิธีใช้งาน)
1) สร้างโปรเจกต์ React (แนะนำ Vite):
   npm create vite@latest stock-app -- --template react
   cd stock-app

2) วางไฟล์นี้เป็น src/App.jsx

3) ติดตั้ง dependencies:
   npm install firebase
   (และถ้าใช้ Tailwind: npm install -D tailwindcss postcss autoprefixer)

4) ใส่ค่า firebaseConfig ของคุณด้านบน

5) สร้าง collection ใน Firestore:
   - "products": { name: string, quantity: number }
   - "promotions": { text: string }

6) รัน: npm run dev

เมื่อเปิดเว็บ:
- ถ้าโค้ดเข้าถูกต้อง (idol หรือ Thir) จะเข้าได้
- มีเมนูเลือก: "สต็อกสินค้า" และ "โปรโมชั่น"
- ออกแบบ Responsive เน้นการใช้งานบนมือถือ แต่เปิดในคอมได้เช่นกัน
*/

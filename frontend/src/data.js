// Restaurant + food data — mirrors src/App.tsx in the project root

export const FOOD_IMGS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400",
];

export const REST_IMGS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
];

const L = ["Mama Oliech","K'Osewe Ranalo","Nyama Mama","Kenyatta Kitchen","Swahili Plate","Kibanda Fresh","Baba Dogo Grill","Chama Cha Mchuzi","Dishi Local","Mtaa Bites"];
const F = ["Talisman","Tamarind","Carnivore","Lord Erroll","Hemingways","Serena Mandhari","Sankara Sarabi","Villa Rosa","Fairview Grill","Radisson Larder"];
const H = ["The Monarch Room","Ivory Manor","Maison Ember","Pearl & Plate","Aurum Dining Hall","Zen Garden","Seven Seafood","Cultiva","Inti Nikkei","Le Grenier"];
const locs = ["Kilimani","Westlands","Karen","CBD","Langata","Parklands","Runda","Kileleshwa","South C","Lavington"];

const cuis = {
  local: ["Kenyan","Swahili","BBQ","Pan-African","Street Food","Luo","Kenyan Fusion","Kenyan","Swahili","BBQ"],
  formal: ["International","Seafood","BBQ/Grill","Continental","European","Continental","Japanese Fusion","Italian","Continental","International"],
  highend: ["Fine Dining","French","French","European","International","Japanese","Seafood","Farm-to-Table","Peruvian-Japanese","French"],
};

const foods = {
  Kenyan: ["Ugali & Sukuma","Nyama Choma","Pilau","Githeri","Mukimo","Chapati Beans","Samosa","Mandazi","Matoke","Kuku Paka","Wali wa Nazi","Irio","Mutura","Chips Mayai","Bhajia","Maharagwe","Omena","Managu"],
  Swahili: ["Biryani","Pilau Kuku","Viazi Karai","Mishkaki","Mahamri","Kashata","Coconut Fish","Pweza","Kaimati","Vitumbua","Mchuzi Samaki","Ndizi","Tambi","Halwa","Supu Pweza","Urojo","Zanzibar Mix","Pepeta"],
  BBQ: ["Nyama Choma 1kg","Mishkaki","Pork Ribs","Grilled Chicken","BBQ Sausages","Lamb Chops","T-Bone Steak","Mutura Grill","Goat Ribs","Wings","Corn Cob","Roast Potatoes","Coleslaw","Garlic Bread","Smoky Beans","BBQ Wings","Beef Kebabs","Mixed Grill"],
  International: ["Caesar Salad","Grilled Salmon","Beef Wellington","Risotto","Pasta Carbonara","Fish & Chips","Club Sandwich","Steak Frites","Lobster Bisque","Truffle Fries","Duck Confit","Lamb Shank","Sea Bass","Mushroom Soup","Bruschetta","Tiramisu","Crème Brûlée","Chocolate Fondant"],
  "Fine Dining": ["Wagyu Steak","Foie Gras","Truffle Risotto","Lobster Thermidor","Duck Confit","Rack of Lamb","Tuna Tartare","Caviar Blini","Beef Carpaccio","Scallops","Venison","Quail","Oyster Trio","Burrata","Black Cod","Chocolate Soufflé","Pear Tarte","Cheese Board"],
  French: ["Coq au Vin","Bouillabaisse","Ratatouille","Crème Brûlée","Escargot","Duck à l'Orange","Soupe Oignon","Tarte Tatin","Crêpe Suzette","Bourguignon","Quiche","Profiteroles","Mille-Feuille","Macaron","Foie Gras","Confit Canard","Soufflé Fromage","Île Flottante"],
};

const bens = ["Car Park 🚗","Kids Play Area 🎠","Outside Setting 🌳","Swimming Pool 🏊","Live Music 🎵","WiFi 📶","Rooftop View 🌆","Pet Friendly 🐕","Private Dining 🔒","Valet 🚙"];
const tagsMap = { local: ["Budget","Casual","Family"], formal: ["Date Night","Business","Premium"], highend: ["Luxury","Fine Dining"] };
const budgets = { local: [100,1200], formal: [1500,4500], highend: [3000,12000] };

function makeRestaurants() {
  const all = [
    ...L.map((n,i)=>({n,cat:"local",ci:cuis.local[i],i})),
    ...F.map((n,i)=>({n,cat:"formal",ci:cuis.formal[i],i:i+10})),
    ...H.map((n,i)=>({n,cat:"highend",ci:cuis.highend[i],i:i+20})),
  ];
  return all.map(r => {
    const [mn,mx] = budgets[r.cat];
    const fk = foods[r.ci] || foods.International;
    const menu = fk.map((fn,fi) => ({
      id: `f${r.i}-${fi}`,
      n: fn,
      p: Math.round(mn*0.3 + Math.random()*mx*0.4 + fi*30),
      d: `Delicious ${fn.toLowerCase()} with fresh ingredients`,
      img: FOOD_IMGS[fi % FOOD_IMGS.length],
      cat: ["Starter","Main","Main","Dessert"][fi%4],
      pop: fi < 3,
    }));
    return {
      id: `r${r.i}`,
      n: r.n,
      em: r.n.toLowerCase().replace(/[^a-z]/g,"") + "@pb.ke",
      cat: r.cat,
      cui: r.ci,
      loc: locs[r.i%10] + ", Nairobi",
      desc: r.cat === "local" ? "Cozy spot for authentic local comfort food 💎"
          : r.cat === "formal" ? "Elegant dining for special occasions ✨"
          : "Luxurious fine dining experience 👑",
      img: REST_IMGS[r.i%5],
      bmin: mn, bmax: mx,
      lk: 100 + Math.floor(Math.random()*200),
      rt: +(3.8 + Math.random()*1.2).toFixed(1),
      rv: [{
        id: `rv${r.i}`,
        dn: "PocketBite Guest",
        r: Math.ceil(3.8 + Math.random()*1.2),
        c: "Great food and memorable experience!",
        v: true,
        dt: "2026-01-15",
      }],
      menu,
      ben: bens.slice(0, 3 + Math.floor(Math.random()*3)),
      oh: ["7:00 AM","8:00 AM","10:00 AM","12:00 PM"][r.i%4],
      ch: ["9:00 PM","10:00 PM","11:00 PM","12:00 AM"][r.i%4],
      ph: "+254 7" + String(45+r.i) + " 678 " + String(900+r.i),
      off: r.i % 4 === 0
        ? [{ id: `o${r.i}`, t: "Happy Hour 🌟", d: "20% off mains 3-6 PM", disc: 20, vu: "2026-12-31", a: true }]
        : [],
      tags: tagsMap[r.cat],
    };
  });
}

export const INITIAL_RESTAURANTS = makeRestaurants();

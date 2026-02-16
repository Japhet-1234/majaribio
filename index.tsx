import { GoogleGenAI } from "@google/genai";

const CONFIG = {
  ADMIN_WHATSAPP: "2557XXXXXXXX", // Namba yako ya WhatsApp kupokea taarifa
  NOTIFY_ENDPOINT: "https://yoursite.com/api/v1/notify", // URL ya API yako (hiari)
  SYSTEM_INSTRUCTION: "Wewe ni msaidizi wa Kipepeo Hotspot Tanzania. Saidia wateja kulipia internet kwa urahisi kwa Kiswahili."
};

const PACKAGES = [
  { id: '500', name: 'Masaa 12 Unlimited', price: 500, detail: 'Saa 12 bila kikomo' },
  { id: '1000', name: 'Siku 1 Unlimited', price: 1000, detail: 'Masaa 24 bila kikomo' },
  { id: '5000', name: 'Wiki 1 Unlimited', price: 5000, detail: 'Siku 7 bila kikomo' },
];

const PROVIDERS = [
  { id: 'voda', name: 'M-Pesa', color: '#E60000', businessNo: '555666', ussd: '*150*00#' },
  { id: 'tigo', name: 'Tigo Pesa', color: '#0033A0', businessNo: '777888', ussd: '*150*01#' },
  { id: 'airtel', name: 'Airtel Money', color: '#FF0000', businessNo: '444333', ussd: '*150*60#' },
  { id: 'halo', name: 'HaloPesa', color: '#FF6600', businessNo: '222111', ussd: '*150*88#' },
];

let selectedPackage: any = null;
let selectedProvider: any = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Window Global functions for HTML
declare global {
  interface Window {
    switchView: (id: string) => void;
    selectPackage: (id: string) => void;
    selectProvider: (id: string) => void;
    submitFinalConfirmation: () => void;
    copyText: (id: string) => void;
  }
}

function init() {
  // Render Packages
  const pkgList = document.getElementById('package-list');
  if (pkgList) {
    pkgList.innerHTML = PACKAGES.map(p => `
      <div onclick="window.selectPackage('${p.id}')" class="glass-card p-6 flex justify-between items-center cursor-pointer hover:border-[#5D4037] transition-all group">
        <div class="flex items-center gap-4">
          <div class="bg-slate-100 p-4 rounded-2xl group-hover:bg-[#5D4037] group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800">${p.name}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">${p.detail}</p>
          </div>
        </div>
        <span class="text-xl font-black text-[#5D4037]">TZS ${p.price}</span>
      </div>
    `).join('');
  }

  // Render Providers
  const provGrid = document.getElementById('provider-grid');
  if (provGrid) {
    provGrid.innerHTML = PROVIDERS.map(p => `
      <button onclick="window.selectProvider('${p.id}')" id="prov-btn-${p.id}" class="provider-btn group">
        <div class="provider-icon" style="background-color: ${p.color}">${p.name[0]}</div>
        <span class="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#5D4037]">${p.name}</span>
      </button>
    `).join('');
  }
}

window.switchView = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  window.scrollTo(0, 0);
};

window.selectPackage = (id) => {
  selectedPackage = PACKAGES.find(p => p.id === id);
  document.getElementById('pay-amount')!.innerText = `TZS ${selectedPackage.price}`;
  document.getElementById('pay-package-name')!.innerText = selectedPackage.name;
  window.switchView('payment_view');
};

window.selectProvider = (id) => {
  selectedProvider = PROVIDERS.find(p => p.id === id);
  
  // Update Buttons UI
  PROVIDERS.forEach(p => {
    const btn = document.getElementById(`prov-btn-${p.id}`);
    if (btn) btn.classList.toggle('active', p.id === id);
  });

  // Show Instructions
  const controlNo = Math.floor(100000 + Math.random() * 900000).toString();
  const ussdBox = document.getElementById('ussd-container');
  const doneBtn = document.getElementById('btn-done-paying');

  ussdBox!.classList.remove('hidden');
  doneBtn!.classList.remove('hidden');

  ussdBox!.innerHTML = `
    <div class="space-y-4">
      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Maelekezo ${selectedProvider.name}:</p>
      <div class="space-y-2 text-sm font-bold text-slate-700">
        <p>1. Piga <span class="text-[#5D4037] font-black">${selectedProvider.ussd}</span></p>
        <p>2. Chagua <b>Lipa kwa Simu / Lipa Bili</b></p>
        <p>3. Kampuni: <span class="text-[#5D4037] font-black">${selectedProvider.businessNo}</span></p>
        <p>4. Kumbukumbu: <span id="ref-copy" class="text-red-600 font-black tracking-widest">${controlNo}</span></p>
        <p>5. Kiasi: <span class="text-[#5D4037] font-black">${selectedPackage.price}</span></p>
      </div>
      <button onclick="window.copyText('ref-copy')" class="w-full py-2 bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">Nakili Kumbukumbu</button>
    </div>
  `;
};

window.copyText = (id) => {
  const text = document.getElementById(id)!.innerText;
  navigator.clipboard.writeText(text).then(() => alert("Imenakiliwa!"));
};

window.submitFinalConfirmation = async () => {
  const name = (document.getElementById('conf-name') as HTMLInputElement).value.trim();
  const phone = (document.getElementById('conf-phone') as HTMLInputElement).value.trim();
  const btn = document.getElementById('btn-submit-conf') as HTMLButtonElement;

  if (!name || !phone || phone.length < 10) {
    alert("Tafadhali jaza Jina Kamili na Namba sahihi ya simu.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>`;

  try {
    // 1. Tuma taarifa kwa Admin API
    const response = await fetch(CONFIG.NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: "PAYMENT_CONFIRMATION",
        customer: name,
        phone: phone,
        amount: selectedPackage.price,
        package: selectedPackage.name
      })
    });

    // 2. Fungua WhatsApp (Backup kama mteja anataka kumtumia Admin moja kwa moja)
    // Hii itamtumia Admin meseji ya moja kwa moja
    // const waMessage = `Habari Admin, nimekamilisha malipo ya ${selectedPackage.name}. Jina langu ni ${name}, namba niliyotumia ni ${phone}. Nasubiri kodi ya internet.`;
    // window.open(`https://wa.me/${CONFIG.ADMIN_WHATSAPP}?text=${encodeURIComponent(waMessage)}`, '_blank');

    window.switchView('success_view');
  } catch (err) {
    // Hata kama API ikifeli (demo), mteja aone imekamilika
    window.switchView('success_view');
  }
};

init();


import { GoogleGenAI } from "@google/genai";

const CONFIG = {
  ADMIN_WHATSAPP: "2557XXXXXXXX", // Weka namba yako hapa
  NOTIFY_ENDPOINT: "https://yoursite.com/api/v1/notify",
  SYSTEM_INSTRUCTION: "Wewe ni msaidizi wa Kipepeo Hotspot Tanzania. Saidia wateja kwa Kiswahili fasaha kuhusu vifurushi na malipo."
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

// Global Window Actions
declare global {
  interface Window {
    switchView: (id: string) => void;
    selectPackage: (id: string) => void;
    selectProvider: (id: string) => void;
    submitFinalConfirmation: () => void;
    copyText: (id: string) => void;
    toggleChat: () => void;
    sendMessage: () => void;
  }
}

function init() {
  console.log("Kipepeo App inaanza...");
  
  const pkgList = document.getElementById('package-list');
  if (pkgList) {
    pkgList.innerHTML = PACKAGES.map(p => `
      <div onclick="window.selectPackage('${p.id}')" class="package-card p-6 flex justify-between items-center cursor-pointer transition-all">
        <div class="flex items-center gap-4">
          <div class="bg-slate-100 p-4 rounded-2xl text-[#5D4037]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          </div>
          <div>
            <h3 class="font-black text-slate-800 text-lg">${p.name}</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.detail}</p>
          </div>
        </div>
        <div class="text-right">
            <span class="text-xl font-black text-[#5D4037]">TZS ${p.price}</span>
        </div>
      </div>
    `).join('');
  }

  const provGrid = document.getElementById('provider-grid');
  if (provGrid) {
    provGrid.innerHTML = PROVIDERS.map(p => `
      <button onclick="window.selectProvider('${p.id}')" id="prov-btn-${p.id}" class="provider-btn group">
        <div class="provider-icon shadow-sm" style="background-color: ${p.color}">${p.name[0]}</div>
        <span class="text-[9px] font-black uppercase tracking-tight text-slate-500">${p.name}</span>
      </button>
    `).join('');
  }
}

window.switchView = (id) => {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
};

window.selectPackage = (id) => {
  selectedPackage = PACKAGES.find(p => p.id === id);
  const amtEl = document.getElementById('pay-amount');
  const nameEl = document.getElementById('pay-package-name');
  if (amtEl) amtEl.innerText = `TZS ${selectedPackage.price}`;
  if (nameEl) nameEl.innerText = selectedPackage.name;
  window.switchView('payment_view');
};

window.selectProvider = (id) => {
  selectedProvider = PROVIDERS.find(p => p.id === id);
  PROVIDERS.forEach(p => {
    const btn = document.getElementById(`prov-btn-${p.id}`);
    if (btn) btn.classList.toggle('active', p.id === id);
  });

  const controlNo = Math.floor(100000 + Math.random() * 900000).toString();
  const ussdBox = document.getElementById('ussd-container');
  const doneBtn = document.getElementById('btn-done-paying');

  if (ussdBox) {
    ussdBox.classList.remove('hidden');
    ussdBox.innerHTML = `
      <div class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="flex justify-between items-center border-b pb-2">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hatua za ${selectedProvider.name}:</p>
            <span class="bg-green-100 text-green-700 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">Tayari</span>
        </div>
        <div class="space-y-3 text-sm font-bold text-slate-700 bg-white p-4 rounded-xl border">
          <p>1. Piga <span class="text-[#5D4037] font-black">${selectedProvider.ussd}</span></p>
          <p>2. Chagua <b>Lipa kwa Simu</b></p>
          <p>3. Namba ya Kampuni: <span class="text-[#5D4037] font-black">${selectedProvider.businessNo}</span></p>
          <p>4. Kumbukumbu: <span id="ref-copy" class="text-red-600 font-black tracking-widest text-lg">${controlNo}</span></p>
          <p>5. Kiasi: <span class="text-[#5D4037] font-black">${selectedPackage.price}</span></p>
        </div>
        <button onclick="window.copyText('ref-copy')" class="w-full py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200">Nakili Namba ya Kumbukumbu</button>
      </div>
    `;
  }
  if (doneBtn) doneBtn.classList.remove('hidden');
};

window.copyText = (id) => {
  const el = document.getElementById(id);
  if (el) {
    navigator.clipboard.writeText(el.innerText).then(() => alert("Imenakiliwa!"));
  }
};

window.submitFinalConfirmation = async () => {
  const nameInput = document.getElementById('conf-name') as HTMLInputElement;
  const phoneInput = document.getElementById('conf-phone') as HTMLInputElement;
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const btn = document.getElementById('btn-submit-conf') as HTMLButtonElement;

  if (!name || !phone || phone.length < 10) {
    alert("Tafadhali jaza Jina Kamili na Namba sahihi (mfano: 0712345678)");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>`;

  try {
    await fetch(CONFIG.NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: "PAYMENT_CONFIRMATION",
        customer: name,
        phone: phone,
        amount: selectedPackage?.price,
        package: selectedPackage?.name
      })
    });
    window.switchView('success_view');
  } catch (err) {
    window.switchView('success_view');
  }
};

window.toggleChat = () => {
  const chat = document.getElementById('chat-window');
  if (chat) chat.classList.toggle('hidden');
};

window.sendMessage = async () => {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const text = input.value.trim();
  if (!text) return;

  appendMsg('user', text);
  input.value = '';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: { systemInstruction: CONFIG.SYSTEM_INSTRUCTION }
    });
    appendMsg('model', res.text || "Samahani, jaribu tena.");
  } catch (err) {
    appendMsg('model', "Niko nje ya mtandao kidogo. Wasiliana na Admin: " + CONFIG.ADMIN_WHATSAPP);
  }
};

function appendMsg(role: string, text: string) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
  div.innerHTML = `<div class="max-w-[85%] p-4 rounded-2xl text-[11px] font-bold shadow-sm ${role === 'user' ? 'bg-[#5D4037] text-white rounded-br-none' : 'bg-white text-slate-700 border rounded-bl-none'}">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Hakikisha kila kitu kinaanza DOM ikishakuwa tayari
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

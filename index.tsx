import { GoogleGenAI } from "@google/genai";

const API_CONFIG = {
  // Hapa ni URL ya seva yako inayopokea malipo (Replace with your actual backend if needed)
  ADMIN_ENDPOINT: "https://yoursite.com/api/v1/admin/notify", 
  SYSTEM_INSTRUCTION: "Wewe ni msaidizi wa Kipepeo Hotspot. Saidia wateja kulipia vifurushi vya 500, 1000, na 5000 nchini Tanzania kwa Kiswahili."
};

const PACKAGES = [
  { id: '12h', name: 'Masaa 12 Unlimited', price: 500, description: 'Saa 12 bila kikomo' },
  { id: '24h', name: 'Masaa 24 Unlimited', price: 1000, description: 'Siku 1 bila kikomo' },
  { id: '1w',  name: 'Wiki 1 Unlimited',  price: 5000, description: 'Wiki 1 bila kikomo' },
];

const PROVIDERS = [
  { id: 'voda', name: 'M-Pesa', color: '#e60000', ussd: '*150*00#', businessNo: '555666' },
  { id: 'tigo', name: 'Tigo Pesa', color: '#0033a0', ussd: '*150*01#', businessNo: '777888' },
  { id: 'airtel', name: 'Airtel Money', color: '#ff0000', ussd: '*150*60#', businessNo: '444333' },
  { id: 'halo', name: 'HaloPesa', color: '#ff6600', ussd: '*150*88#', businessNo: '222111' },
];

let selectedPackage: any = null;
let selectedProvider: any = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Window Global Functions kwa ajili ya HTML calls
declare global {
  interface Window {
    selectPackage: (id: string) => void;
    selectProvider: (id: string) => void;
    switchView: (id: string) => void;
    processDirectPayment: () => Promise<void>;
    notifyAdmin: () => Promise<void>;
    copyToClipboard: (id: string) => void;
    toggleChat: () => void;
    sendMessage: () => Promise<void>;
  }
}

function initApp() {
  // Render Packages
  const pkgList = document.getElementById('package-list');
  if (pkgList) {
    pkgList.innerHTML = PACKAGES.map(p => `
      <div onclick="window.selectPackage('${p.id}')" class="glass-card p-6 rounded-[2rem] hover:border-[#5D4037] hover:shadow-lg cursor-pointer transition-all flex justify-between items-center group">
        <div class="flex items-center gap-4">
          <div class="bg-[#5D4037]/5 p-4 rounded-2xl text-[#5D4037] group-hover:bg-[#5D4037] group-hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800 text-lg">${p.name}</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${p.description}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-2xl font-black text-[#5D4037]">TZS ${p.price}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Networks
  const provList = document.getElementById('provider-grid');
  if (provList) {
    provList.innerHTML = PROVIDERS.map(p => `
      <button onclick="window.selectProvider('${p.id}')" id="prov-${p.id}" class="flex flex-col items-center gap-2 p-4 rounded-3xl border-2 border-slate-50 bg-slate-50/50 transition-all">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[10px]" style="background-color: ${p.color}">${p.name[0]}</div>
        <span class="text-[8px] font-black uppercase tracking-widest text-slate-400">${p.name}</span>
      </button>
    `).join('');
  }
}

window.selectPackage = (id) => {
  selectedPackage = PACKAGES.find(p => p.id === id);
  document.getElementById('buy-package-title')!.innerText = selectedPackage.name;
  document.getElementById('buy-package-price')!.innerText = `TZS ${selectedPackage.price}`;
  window.switchView('buy_direct');
};

window.selectProvider = (id) => {
  selectedProvider = PROVIDERS.find(p => p.id === id);
  PROVIDERS.forEach(p => {
    const btn = document.getElementById(`prov-${p.id}`);
    if (btn) {
      if (p.id === id) {
        btn.classList.add('border-[#5D4037]', 'bg-white', 'shadow-md', 'scale-105');
        btn.querySelector('span')!.classList.add('text-[#5D4037]');
      } else {
        btn.classList.remove('border-[#5D4037]', 'bg-white', 'shadow-md', 'scale-105');
        btn.querySelector('span')!.classList.remove('text-[#5D4037]');
      }
    }
  });
};

window.processDirectPayment = async () => {
  const name = (document.getElementById('input-name') as HTMLInputElement).value.trim();
  const phone = (document.getElementById('input-phone') as HTMLInputElement).value.trim();
  const btn = document.getElementById('btn-pay-now') as HTMLButtonElement;

  if (!name || !phone || phone.length < 10) return alert("Jaza Jina na Namba sahihi.");
  if (!selectedProvider) return alert("Chagua Mtandao.");

  btn.disabled = true;
  btn.innerHTML = `<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>`;

  setTimeout(() => {
    const controlNo = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('instr-price')!.innerText = `TZS ${selectedPackage.price}`;
    document.getElementById('instr-control')!.innerText = controlNo;
    
    document.getElementById('instr-steps')!.innerHTML = `
      <div class="space-y-4 text-xs font-bold">
        <p class="text-[#5D4037] border-b pb-2 uppercase tracking-widest">Maelekezo ${selectedProvider.name}:</p>
        <p>1. Piga <b class="text-[#5D4037]">${selectedProvider.ussd}</b></p>
        <p>2. Lipa kwa Simu / Lipa Bili</p>
        <p>3. Kampuni: <b class="text-[#5D4037]">${selectedProvider.businessNo}</b></p>
        <p>4. Kumbukumbu: <b class="text-[#5D4037] tracking-widest">${controlNo}</b></p>
        <p>5. Kiasi: <b class="text-red-600">${selectedPackage.price}</b></p>
      </div>
    `;
    
    window.switchView('payment_instructions');
    btn.disabled = false;
    btn.innerText = "LIPA SASA";
  }, 1000);
};

window.notifyAdmin = async () => {
  const name = (document.getElementById('input-name') as HTMLInputElement).value;
  const phone = (document.getElementById('input-phone') as HTMLInputElement).value;
  const btn = document.getElementById('btn-notify') as HTMLButtonElement;

  btn.disabled = true;
  btn.innerHTML = `<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div>`;

  try {
    // Notify Admin (Real API call Simulation)
    await fetch(API_CONFIG.ADMIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, amount: selectedPackage.price, pkg: selectedPackage.name })
    });
    window.switchView('pending_admin');
  } catch (e) {
    window.switchView('pending_admin');
  }
};

window.switchView = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  window.scrollTo(0, 0);
};

window.copyToClipboard = (id) => {
  const txt = document.getElementById(id)!.innerText;
  navigator.clipboard.writeText(txt).then(() => alert("Imenakiliwa!"));
};

window.toggleChat = () => {
  document.getElementById('chat-window')?.classList.toggle('hidden');
};

window.sendMessage = async () => {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  appendMsg('user', text);
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: { systemInstruction: API_CONFIG.SYSTEM_INSTRUCTION }
    });
    appendMsg('model', res.text || "Naomba nisaidie.");
  } catch (err) {
    appendMsg('model', "Jaribu tena baadaye.");
  }
};

function appendMsg(role: string, text: string) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
  div.innerHTML = `<div class="max-w-[85%] p-4 rounded-2xl shadow-sm text-[10px] font-bold ${role === 'user' ? 'bg-[#5D4037] text-white' : 'bg-white text-slate-700 border'}">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

initApp();
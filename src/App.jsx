import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, List, Users, Gem, User, Eye, Lock, Mail, ChevronRight, LogOut, KeyRound, ArrowLeft, Copy, Activity, Zap, AlertCircle, CheckCircle2, Loader2, History, Clock, Wallet, ArrowDownRight, Globe } from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// 1. BUSINESS CONFIGURATION & CURRENCIES (🟢 UPDATED VIP LEVELS)
// ==========================================
const VIP_TIERS = {
  0: { name: "Non-VIP", cost: 0, daily: 0, minWithdraw: 50 },
  1: { name: "VIP 1", cost: 25, daily: 5, minWithdraw: 130 },
  2: { name: "VIP 2", cost: 35, daily: 7, minWithdraw: 150 },
  3: { name: "VIP 3", cost: 50, daily: 10, minWithdraw: 250 },
  4: { name: "VIP 4", cost: 75, daily: 15, minWithdraw: 380 },
  5: { name: "VIP 5", cost: 100, daily: 20, minWithdraw: 550 },
  6: { name: "VIP 6", cost: 150, daily: 30, minWithdraw: 800 }
};

const WITHDRAW_COINS = [
  { id: 1, coin: "USDT", network: "TRC20" },
  { id: 2, coin: "USDT", network: "BEP20" },
  { id: 3, coin: "USDT", network: "ERC20" },
  { id: 4, coin: "TON", network: "TON Network" },
  { id: 5, coin: "BTC", network: "Bitcoin" },
  { id: 6, coin: "ETH", network: "Ethereum" },
  { id: 7, coin: "BNB", network: "BSC" },
  { id: 8, coin: "TRX", network: "TRON" },
  { id: 9, coin: "SOL", network: "Solana" },
  { id: 10, coin: "MATIC", network: "Polygon" },
  { id: 11, coin: "LTC", network: "Litecoin" },
  { id: 12, coin: "DOGE", network: "Dogecoin" },
  { id: 13, coin: "XRP", network: "Ripple" }
];

const getHighestVip = (user) => {
  if (!user || !user.ownedVips) return user?.vipLevel || 0;
  const vips = Object.keys(user.ownedVips).map(Number);
  return vips.length > 0 ? Math.max(...vips) : 0;
};

// ==========================================
// 2. CUSTOM COMPONENTS (POPUPS & UI)
// ==========================================
const CustomPopup = ({ message, type, onClose }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-20 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
    <div className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${type === 'success' ? 'bg-teal-500/90 border-teal-400 text-[#0B132B]' : 'bg-red-500/90 border-red-400 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
      <p className="font-bold text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">✕</button>
    </div>
  </motion.div>
);

const SideBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${active ? 'bg-gradient-to-r from-teal-500/20 to-transparent border-l-4 border-teal-400 text-white shadow-[inset_0px_0px_20px_rgba(45,212,191,0.05)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent'}`}>
    {icon} <span>{label}</span>
  </button>
);

const BottomBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-teal-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} <span className="text-[10px] font-semibold tracking-wide">{label}</span>
  </button>
);

const AuthInput = ({ icon: Icon, type, placeholder, value, onChange, isRequired = true }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
      <input 
        type={type === 'password' && !show ? 'password' : (type === 'password' ? 'text' : type)} 
        placeholder={placeholder} value={value} onChange={onChange} required={isRequired}
        className="w-full bg-[#111A3A]/50 text-white placeholder-slate-500 px-12 py-3.5 rounded-xl border border-white/10 focus:border-teal-400/50 focus:outline-none transition-all shadow-inner" 
      />
      {type === 'password' && <Eye className={`absolute right-4 top-3.5 cursor-pointer transition-colors ${show ? 'text-teal-400' : 'text-slate-500'}`} size={20} onClick={() => setShow(!show)} />}
    </div>
  );
};

const UsdtIcon = ({ sizeClass = "w-10 h-10 text-lg" }) => (
  <div className={`${sizeClass} bg-gradient-to-br from-[#26A17B] to-[#1b7559] rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(38,161,123,0.3)]`}>
    <span className="text-white font-bold font-sans">₮</span>
  </div>
);

// ==========================================
// 3. AUTHENTICATION SCREENS 
// ==========================================
const AuthLayout = ({ children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex items-center justify-center p-4 bg-[#0B132B] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#132043] via-[#0B132B] to-[#060B19]">
    <div className="w-full max-w-md bg-white/[0.02] p-8 md:p-10 rounded-3xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl relative">
      {children}
    </div>
  </motion.div>
);

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: user, error: dbError } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
      if (dbError || !user) setError('Invalid Corporate Email or Password.');
      else { localStorage.setItem('userEmail', user.email); navigate('/dashboard'); }
    } catch (err) { setError('System connection error.'); }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex justify-center mb-8"><div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.3)]"><Zap className="text-white fill-white" size={32} /></div></div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white tracking-tight">Thunder Platform</h2>
      {error && <p className="text-red-400 text-sm text-center mb-6 bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput icon={Mail} type="email" placeholder="Corporate Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthInput icon={Lock} type="password" placeholder="Access Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <motion.button whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-[#0B132B] font-bold py-4 rounded-xl mt-4">
          {loading ? 'Connecting...' : 'Secure Sign In'}
        </motion.button>
        <p className="text-center text-slate-400 text-sm mt-6">New to Thunder? <span onClick={() => navigate('/register')} className="text-teal-400 font-semibold cursor-pointer">Register Now</span></p>
      </form>
    </AuthLayout>
  );
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState({ email: '', password: '', secPassword: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const refCode = "REF" + Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      let level2Code = null;
      if (formData.inviteCode) {
        const { data: inviter } = await supabase.from('users').select('*').eq('referral_code', formData.inviteCode).single();
        if (inviter) {
          level2Code = inviter.referred_by; 
          const emailParts = formData.email.split('@');
          const maskedEmail = emailParts[0].substring(0, 3) + "***@" + emailParts[1];
          const newReferrals = inviter.my_referrals || [];
          newReferrals.push({ email: maskedEmail, date: new Date().toISOString() });
          
          await supabase.from('users').update({ my_referrals: newReferrals, team_size: (inviter.team_size || 0) + 1 }).eq('email', inviter.email);
        }
      }

      const { error: dbError } = await supabase.from('users').insert([{
        email: formData.email, password: formData.password, sec_password: formData.secPassword,
        referral_code: refCode, referred_by: formData.inviteCode || null, level2_referred_by: level2Code,
        balance: 0, refer_balance: 0, total_recharge: 0, team_size: 0, owned_vips: {}, my_referrals: [], tx_history: []
      }]);

      if (dbError) setError('Database Error. Email might already exist.');
      else { setSuccess('Registration successful!'); setTimeout(() => navigate('/login'), 1500); }
    } catch (err) { setError('System Error!'); }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center mb-8 text-white">Create Account</h2>
      {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
      {success && <p className="text-teal-400 text-sm text-center mb-4">{success}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <AuthInput icon={Mail} type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <AuthInput icon={Lock} type="password" placeholder="Login Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <AuthInput icon={KeyRound} type="password" placeholder="Fund Password" value={formData.secPassword} onChange={(e) => setFormData({...formData, secPassword: e.target.value})} />
        <AuthInput icon={Users} type="text" placeholder="Invite Code (Optional)" value={formData.inviteCode} onChange={(e) => setFormData({...formData, inviteCode: e.target.value})} isRequired={false} />
        <motion.button whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full bg-teal-400 text-[#0B132B] font-bold py-4 rounded-xl mt-4">
          {loading ? 'Creating...' : 'Complete'}
        </motion.button>
        <p className="text-center text-slate-400 text-sm mt-6">Already a member? <span onClick={() => navigate('/login')} className="text-teal-400 font-semibold cursor-pointer">Sign In</span></p>
      </form>
    </AuthLayout>
  );
};

// ==========================================
// 4. MODALS (RECHARGE, WITHDRAWAL & HISTORY)
// ==========================================
const RechargeModal = ({ onClose, userEmail }) => {
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('USDT_TRX'); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayNow = async () => {
    if (!amount || parseFloat(amount) < 1) return setErrorMsg("Minimum deposit is $1");
    setIsLoading(true); setErrorMsg('');
    try {
      const response = await fetch('/.netlify/functions/createInvoice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), currency: network, email: userEmail })
      });
      const result = await response.json();
      if (result.success) window.location.href = result.checkoutUrl;
      else setErrorMsg(result.message || "Could not generate payment link.");
    } catch (error) { setErrorMsg("System error. Check backend."); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/90 backdrop-blur-md">
      <div className="bg-[#111A3A] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-6 text-center text-[#0B132B]">
          <h3 className="font-bold text-xl mb-1">Add Funds via Plisio</h3>
          <p className="text-sm font-medium opacity-80">Instant No-KYC Deposit</p>
        </div>
        {isLoading ? (
           <div className="p-12 flex flex-col items-center justify-center space-y-6">
              <Loader2 size={60} className="text-teal-400 animate-spin" />
              <h3 className="text-xl font-bold text-white text-center">Generating Invoice...</h3>
           </div>
        ) : (
          <div className="p-8 space-y-5">
            <div>
              <p className="text-slate-400 text-sm mb-2">Deposit Amount ($ USD)</p>
              <input type="number" placeholder="Min $1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0B132B] border border-white/10 p-4 rounded-xl text-white text-xl focus:border-teal-400 focus:outline-none" />
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Select Crypto</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'USDT_TRX', name: 'USDT (TRC20)' }, { id: 'USDT_BSC', name: 'USDT (BEP20)' }, { id: 'TON', name: 'TON Coin' }].map((coin) => (
                  <button key={coin.id} onClick={() => setNetwork(coin.id)} className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${network === coin.id ? 'bg-teal-500/20 border-teal-400 text-teal-400' : 'border-white/10 text-slate-400 hover:border-white/30'}`}>{coin.name}</button>
                ))}
              </div>
            </div>
            {errorMsg && <div className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg">{errorMsg}</div>}
            <div className="flex gap-4 mt-6">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300">Cancel</button>
              <button onClick={handlePayNow} className="flex-1 py-3.5 rounded-xl bg-teal-400 text-[#0B132B] font-bold">Pay via Plisio</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WithdrawalScreen = ({ user, onClose, onWithdraw, showPopup }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [secPassword, setSecPassword] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(WITHDRAW_COINS[0]);
  
  const highestVip = getHighestVip(user);
  const vipConfig = VIP_TIERS[highestVip] || VIP_TIERS[0];
  const totalBalance = (user?.balance || 0) + (user?.refer_balance || 0);

  const handleWithdrawRequest = () => {
    // 🟢 HIDDEN LOGIC: User must own at least VIP 1
    if(highestVip === 0) {
      return showPopup("You must purchase at least one VIP level before you can withdraw funds.", "error");
    }

    if(!amount || parseFloat(amount) < vipConfig.minWithdraw) return showPopup(`Min withdrawal for ${vipConfig.name} is $${vipConfig.minWithdraw}`, "error");
    if(parseFloat(amount) > totalBalance) return showPopup("Insufficient Balance!", "error");
    if(secPassword !== user.secPassword) return showPopup("Incorrect Fund Password!", "error");
    if(!address) return showPopup("Please enter wallet address!", "error");
    
    onWithdraw(parseFloat(amount), address, selectedCoin.coin, selectedCoin.network);
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-50 bg-[#0B132B] text-white overflow-y-auto">
      <div className="bg-[#111A3A] p-5 flex items-center justify-between border-b border-white/5 sticky top-0 z-50"><button onClick={onClose}><ArrowLeft size={20} /></button><h2 className="font-bold">Withdraw Assets</h2><div className="w-10"></div></div>
      
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-[#1A264F] to-[#111A3A] p-6 rounded-3xl border border-white/5 shadow-2xl">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Total Available</p>
          <p className="text-4xl font-black text-white">${totalBalance.toFixed(2)} <span className="text-sm text-teal-400 font-normal">USDT</span></p>
          <div className="mt-4 flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
             <AlertCircle size={14}/> <span className="text-[10px] font-bold">Min Limit: ${vipConfig.minWithdraw} USDT ({vipConfig.name})</span>
          </div>
        </div>

        {/* 🟢 NEW YELLOW WARNING BOX */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3.5 rounded-xl flex gap-3 items-start shadow-inner">
           <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5"/>
           <p className="text-xs text-yellow-500/90 leading-relaxed font-medium">
             <strong>Warning:</strong> Please enter your withdrawal address correctly. Funds sent to a wrong address in crypto cannot be recovered.
           </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-xs mb-2 uppercase font-bold">1. Select Coin & Network</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
               {WITHDRAW_COINS.map(item => (
                 <button key={item.id} onClick={() => setSelectedCoin(item)} className={`p-3 rounded-2xl border flex flex-col items-start transition-all ${selectedCoin.id === item.id ? 'bg-teal-500/20 border-teal-400 shadow-lg' : 'bg-[#111A3A] border-white/5 hover:border-white/10'}`}>
                    <span className={`text-xs font-black ${selectedCoin.id === item.id ? 'text-teal-400' : 'text-white'}`}>{item.coin}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">{item.network}</span>
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400 text-xs uppercase font-bold">2. Payment Details</p>
            <div className="relative">
               <Wallet className="absolute left-4 top-4 text-slate-500" size={18}/>
               <input type="text" placeholder={`${selectedCoin.coin} (${selectedCoin.network}) Address`} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#111A3A] border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-teal-400 outline-none transition-all" />
            </div>
            <div className="relative">
               <span className="absolute left-4 top-4 text-slate-500 font-bold">$</span>
               <input type="number" placeholder="Amount to Withdraw" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#111A3A] border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-teal-400 outline-none transition-all" />
            </div>
            <AuthInput icon={KeyRound} type="password" placeholder="Fund Password" value={secPassword} onChange={(e) => setSecPassword(e.target.value)} />
            
            <div className="bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10 flex justify-between items-center">
               <span className="text-slate-400 text-xs">Estimated Arrival</span>
               <span className="text-teal-400 font-bold text-sm">Within 24 Hours</span>
            </div>

            <button onClick={handleWithdrawRequest} className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-[#0B132B] font-black py-4 rounded-2xl shadow-xl shadow-teal-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all">Submit Request</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 🟢 NEW HISTORY MODAL
const HistoryModal = ({ user, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B132B]/90 backdrop-blur-md p-4">
    <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="bg-[#111A3A] w-full max-w-md rounded-[35px] border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B132B] sticky top-0 z-10">
        <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm"><History size={18} className="text-teal-400"/> Transaction Logs</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-full"><ArrowDownRight size={16}/></button>
      </div>
      <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
        {user?.tx_history && user.tx_history.length > 0 ? [...user.tx_history].reverse().map((tx, idx) => (
          <div key={idx} className="flex justify-between items-center bg-[#0B132B] p-4 rounded-2xl border border-white/5">
            <div>
               <p className="text-sm font-black text-white">{tx.type}</p>
               <p className="text-[10px] text-slate-500 mt-1 font-bold">
                 {new Date(tx.date).toLocaleString()} 
                 {tx.status && (
                   <span className={`ml-3 px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${tx.status === 'Done' ? 'bg-teal-500/20 text-teal-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                     {tx.status === 'Done' ? 'Success' : tx.status}
                   </span>
                 )}
               </p>
            </div>
            <span className={`font-black text-sm ${tx.amount > 0 ? 'text-teal-400' : 'text-red-400'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount} <span className="text-[10px] font-normal">USDT</span></span>
          </div>
        )) : <div className="text-center text-slate-500 py-10 bg-[#0B132B] rounded-2xl border border-dashed border-white/5">No transaction logs found.</div>}
      </div>
    </motion.div>
  </div>
);

// ==========================================
// 5. DASHBOARD TABS
// ==========================================
const HomeTab = ({ user, onAction, onUnlockVip }) => {
  const totalBalance = (user?.balance || 0) + (user?.refer_balance || 0);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <div className="w-full h-56 bg-gradient-to-br from-[#162758] to-[#0A1128] rounded-3xl flex flex-col justify-center px-8 border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <span className="text-teal-400 font-bold text-sm tracking-widest uppercase mb-2">Total Assets</span>
        <h2 className="text-4xl font-black text-white leading-tight">${totalBalance.toFixed(2)} <span className="text-sm font-normal text-slate-400">USDT</span></h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {['Recharge', 'Withdraw', 'Invite'].map((item, i) => (
          <div key={i} onClick={() => onAction(item === 'Invite' ? 'Invite Friends' : item)} className="flex flex-col items-center gap-3 p-4 bg-[#111A3A]/80 rounded-2xl border border-white/5 hover:border-teal-500/50 cursor-pointer shadow-lg">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-teal-400">{i === 0 ? <Zap size={20}/> : i === 1 ? <ArrowDownRight size={20}/> : <Users size={20}/>}</div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </div>
      <LiveMemberActivity />
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Globe size={20} className="text-teal-400"/> Investment Hall</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Object.entries(VIP_TIERS).map(([level, data]) => level > 0 && (
          <div key={level} onClick={() => onUnlockVip(level, data.cost)} className="bg-[#111A3A]/80 p-5 rounded-3xl border border-white/5 hover:border-teal-500/50 cursor-pointer relative shadow-xl">
            <div className="w-full h-24 bg-[#0B132B] rounded-2xl flex flex-col items-center justify-center mb-4 border border-white/5">
              <UsdtIcon />
              <div className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded font-bold">VIP {level}</div>
              {user?.ownedVips && user.ownedVips[level] && user.ownedVips[level].expiry > Date.now() && <div className="absolute bottom-2 right-2 bg-teal-500 text-white rounded-full p-1"><CheckCircle2 size={12}/></div>}
            </div>
            <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Required Fund</p>
            <p className="text-lg font-black text-white">${data.cost}.00</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const TaskTab = ({ user, onClaimDaily }) => {
  const [timers, setTimers] = useState({});
  const ownedVips = user?.ownedVips || {};
  const vipKeys = Object.keys(ownedVips);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      vipKeys.forEach(level => {
        const vipData = ownedVips[level];
        if (Date.now() > vipData.expiry) { newTimers[level] = "Expired"; return; }
        const lastClaim = vipData.lastClaimTime;
        if (!lastClaim) { newTimers[level] = "Available Now"; return; }
        const diff = (lastClaim + 24 * 60 * 60 * 1000) - Date.now();
        if (diff <= 0) newTimers[level] = "Available Now";
        else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          newTimers[level] = `${h}h ${m}m ${s}s`;
        }
      });
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [ownedVips, vipKeys]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      {vipKeys.length === 0 ? (
        <div className="bg-[#111A3A]/50 rounded-3xl border border-white/5 p-16 text-center shadow-2xl border-dashed">
          <Activity size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white">No Active Nodes</h3>
          <p className="text-slate-500 text-sm mt-2">Unlock a VIP portfolio to start claiming rewards.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-teal-400"/> Trading Operations</h3>
          {vipKeys.map(level => {
            const status = timers[level] || "Loading...";
            const isReady = status === "Available Now";
            const isExpired = status === "Expired";
            return (
              <div key={level} className={`p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg ${isExpired ? 'bg-red-500/10' : 'bg-[#111A3A]'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#0B132B] rounded-2xl flex justify-center items-center shadow-inner"><span className="text-yellow-500 font-black text-xl">V{level}</span></div>
                  <div><p className="font-bold text-white text-lg">VIP {level} Node</p><p className="text-sm text-teal-400 font-bold">${VIP_TIERS[level].daily} / Day</p></div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="bg-[#0B132B] px-4 py-3 rounded-xl text-teal-400 font-mono text-xs border border-white/5 flex items-center gap-2">{isExpired ? <AlertCircle size={14}/> : <Clock size={14}/>} {status}</div>
                  <button disabled={!isReady || isExpired} onClick={() => onClaimDaily(level, VIP_TIERS[level].daily)} className={`px-8 py-3 rounded-xl font-black transition-all ${isReady ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-black shadow-lg shadow-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>
                    {isExpired ? 'Expired' : 'Claim'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const TeamTab = ({ user }) => {
  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <div className="bg-gradient-to-br from-[#162758] to-[#0A1128] p-8 rounded-3xl mb-8 relative border border-white/5 shadow-2xl">
        <div className="absolute top-[-10%] right-[-5%] w-32 h-32 bg-teal-400/5 rounded-full blur-2xl"></div>
        <p className="text-sm text-teal-400 font-black mb-2 uppercase tracking-widest">Partner Program</p>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          🚀 <strong className="text-white">Level 1:</strong> Earn <span className="text-teal-400 font-bold text-lg">7%</span> on direct referral deposits.<br/>
          🚀 <strong className="text-white">Level 2:</strong> Earn <span className="text-teal-400 font-bold text-lg">3%</span> on indirect team deposits.
        </p>
        <div className="bg-[#0B132B] p-4 rounded-2xl flex justify-between items-center border border-white/10 shadow-inner">
          <div className="overflow-hidden mr-4"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Invite Link</p><p className="text-xs font-bold truncate text-teal-400 font-mono">{referralLink}</p></div>
          <button onClick={() => { navigator.clipboard.writeText(referralLink); }} className="bg-teal-400 text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"><Copy size={18}/></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111A3A] p-6 rounded-3xl border border-white/5 shadow-xl"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Direct Team</p><p className="text-3xl font-black text-white">{user?.my_referrals?.length || 0}</p></div>
        <div className="bg-[#111A3A] p-6 rounded-3xl border border-white/5 shadow-xl"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Referral Wallet</p><p className="text-3xl font-black text-teal-400">${parseFloat(user?.refer_balance || 0).toFixed(2)}</p></div>
      </div>
      <h3 className="font-bold text-lg mb-4 text-white">Direct Members</h3>
      <div className="space-y-3">
        {user?.my_referrals && user.my_referrals.length > 0 ? user.my_referrals.map((ref, idx) => (
          <div key={idx} className="bg-[#111A3A]/60 p-4 rounded-2xl flex justify-between items-center border border-white/5">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><User size={16} className="text-teal-400"/></div><span className="font-mono text-sm text-slate-300">{ref.email}</span></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(ref.date).toLocaleDateString()}</span>
          </div>
        )) : <div className="text-center text-slate-500 py-10 bg-[#111A3A]/30 rounded-3xl border border-dashed border-white/5">No team data yet.</div>}
      </div>
    </motion.div>
  );
};

const VipTab = ({ user, onUnlockVip }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 space-y-4">
    {Object.entries(VIP_TIERS).map(([level, d]) => {
      if (level == 0) return null;
      const vipData = user?.ownedVips && user.ownedVips[level];
      const isOwned = vipData && vipData.expiry > Date.now();
      return (
        <div key={level} className={`bg-[#111A3A] rounded-3xl p-6 flex items-center gap-6 border transition-all ${isOwned ? 'border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.1)]' : 'border-white/5'}`}>
          <div className="w-20 h-20 bg-[#0B132B] rounded-2xl flex flex-col justify-center items-center shadow-inner"><UsdtIcon sizeClass="w-8 h-8"/><span className="text-yellow-500 text-[10px] mt-1 font-black">Tier {level}</span></div>
          <div className="flex-1">
            <p className="font-black text-white text-lg">{d.name} Portfolio</p>
            <p className="text-teal-400 font-black text-xl">${d.daily} <span className="text-xs font-normal text-slate-500">/ Day (30d)</span></p>
            <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-widest">Entry: ${d.cost} USDT</p>
          </div>
          <button disabled={isOwned} onClick={() => onUnlockVip(level, d.cost)} className={`px-6 py-3 rounded-xl font-black shadow-lg transition-all ${isOwned ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' : 'bg-gradient-to-r from-teal-400 to-teal-500 text-black hover:scale-105'}`}>{isOwned ? "Active" : "Buy"}</button>
        </div>
      );
    })}
  </motion.div>
);

const ProfileTab = ({ user, onAction, onLogout }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="bg-[#111A3A] p-8 rounded-[40px] text-center mb-6 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl shadow-teal-500/20 border-4 border-white/10">👤</div>
      <p className="text-xl font-black text-white">{user?.email}</p>
      <div className="bg-[#0B132B] rounded-3xl p-6 flex justify-between mt-8 border border-white/5 shadow-inner">
        <div className="w-1/2"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Main Wallet</p><p className="text-2xl font-black text-white">${parseFloat(user?.balance || 0).toFixed(2)}</p></div>
        <div className="w-1/2 border-l border-white/5 pl-4"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">Referral Wallet</p><p className="text-2xl font-black text-teal-400">${parseFloat(user?.refer_balance || 0).toFixed(2)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
         <button onClick={() => onAction('Recharge')} className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02]"><Zap size={20}/> Deposit</button>
         <button onClick={() => onAction('Withdraw')} className="flex items-center justify-center gap-2 bg-white/5 py-4 rounded-2xl border border-white/10 text-white font-black hover:bg-white/10 transition-all"><ArrowLeft size={20}/> Withdraw</button>
      </div>
    </div>

    {/* 🟢 NEW HISTORY BUTTON */}
    <div className="mb-6">
      <button onClick={() => onAction('History')} className="w-full bg-[#111A3A] p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/5 transition-all shadow-lg group">
        <div className="flex items-center gap-4 font-black text-white text-sm tracking-wider uppercase"><History size={20} className="text-teal-400"/> Transaction History</div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-teal-400 transition-all"/>
      </button>
    </div>

    <div onClick={onLogout} className="bg-red-500/10 p-5 rounded-2xl text-red-500 flex justify-between items-center cursor-pointer border border-red-500/20 hover:bg-red-500/20 transition-all group">
       <div className="flex items-center gap-3 font-black text-sm uppercase tracking-widest"><LogOut size={20}/> Secure Logout</div>
       <ChevronRight size={18} className="opacity-30 group-hover:opacity-100 transition-all"/>
    </div>
  </motion.div>
);

// ==========================================
// 7. MAIN LOGIC & ROUTING
// ==========================================
const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('userEmail') ? children : <Navigate to="/login" replace />;
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // 🟢 State for History Modal
  const [user, setUser] = useState(null);
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCloudData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return navigate('/login');
      const { data } = await supabase.from('users').select('*').eq('email', email).single();
      if (data) {
        setUser({
          email: data.email, balance: data.balance || 0, refer_balance: data.refer_balance || 0,
          totalRecharge: data.total_recharge || 0, ownedVips: data.owned_vips || {},
          secPassword: data.sec_password, referralCode: data.referral_code,
          referredBy: data.referred_by, teamSize: data.team_size || 0,
          my_referrals: data.my_referrals || [], tx_history: data.tx_history || []
        });
      } else { localStorage.removeItem('userEmail'); navigate('/login'); }
    };
    fetchCloudData();
  }, [navigate, showRecharge]);

  const syncUserToCloud = async (updatedUser) => {
    setUser(updatedUser); 
    await supabase.from('users').update({
      balance: updatedUser.balance, refer_balance: updatedUser.refer_balance, owned_vips: updatedUser.ownedVips, tx_history: updatedUser.tx_history
    }).eq('email', updatedUser.email);
  };

  const showPopup = (message, type = 'success') => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 4000);
  };

  const handleVipUnlock = async (level, cost) => {
    const owned = user.ownedVips || {};
    if (owned[level] && owned[level].expiry > Date.now()) return showPopup(`VIP ${level} is already active!`, 'error');
    
    const totalBalance = user.balance + user.refer_balance;
    if (totalBalance < cost) return setShowRecharge(true);
    
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const historyEntry = { type: `Unlocked VIP ${level}`, amount: -cost, date: new Date().toISOString() };
    
    let newBalance = user.balance;
    let newReferBalance = user.refer_balance;
    if (newBalance >= cost) newBalance -= cost;
    else { const diff = cost - newBalance; newBalance = 0; newReferBalance -= diff; }

    const updated = { ...user, balance: newBalance, refer_balance: newReferBalance, ownedVips: { ...owned, [level]: { lastClaimTime: null, expiry: Date.now() + thirtyDaysMs } }, tx_history: [...(user.tx_history || []), historyEntry] };
    await syncUserToCloud(updated);
    showPopup(`You owned VIP Level ${level} Node for 30 Days!`);
  };

  const handleClaim = async (level, amt) => {
    const owned = user.ownedVips || {};
    const historyEntry = { type: `Yield VIP ${level}`, amount: amt, date: new Date().toISOString() };
    const updated = { ...user, balance: user.balance + amt, ownedVips: { ...owned, [level]: { ...owned[level], lastClaimTime: Date.now() } }, tx_history: [...(user.tx_history || []), historyEntry] };
    await syncUserToCloud(updated);
    showPopup(`Success! $${amt} USDT Reward Collected.`);
  };

  const handleWithdrawal = async (amt, address, coin, network) => {
    const historyEntry = { 
      type: `Withdrawal (${coin}-${network})`, amount: -amt, date: new Date().toISOString(), status: "Pending (24h)", address: address
    };
    
    let newBalance = user.balance;
    let newReferBalance = user.refer_balance;
    if (newBalance >= amt) newBalance -= amt;
    else { const diff = amt - newBalance; newBalance = 0; newReferBalance -= diff; }

    const updated = { ...user, balance: newBalance, refer_balance: newReferBalance, tx_history: [...(user.tx_history || []), historyEntry] };
    await syncUserToCloud(updated);
    setShowWithdrawal(false);
    showPopup(`Withdrawal processing in 24 Hours to ${address.substring(0,6)}...`);
  };

  const handleLogout = () => { localStorage.removeItem('userEmail'); navigate('/login'); };
  
  // 🟢 ROUTING ACTION HANDLER
  const handleAction = (type) => { 
    if(type === 'Withdraw') setShowWithdrawal(true);
    else if(type === 'Recharge') setShowRecharge(true);
    else if(type === 'History') setShowHistoryModal(true); // Open History Modal
    else setActiveTab('team'); 
  };

  if (!user) return <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-teal-400"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <>
      <AnimatePresence>
        {popup && <CustomPopup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
        {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} userEmail={user.email} />}
        {showWithdrawal && <WithdrawalScreen user={user} onClose={() => setShowWithdrawal(false)} onWithdraw={handleWithdrawal} showPopup={showPopup} />}
        {showHistoryModal && <HistoryModal user={user} onClose={() => setShowHistoryModal(false)} />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-black text-slate-200 selection:bg-teal-500/30">
        <header className="bg-[#0B132B]/80 backdrop-blur-xl p-4 flex justify-between items-center border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-3"><Zap size={22} className="text-teal-400 fill-teal-400" /><span className="font-black text-lg tracking-tighter uppercase">Thunder</span></div>
          <div className="bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div> Secure Node
          </div>
        </header>

        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <aside className="hidden md:flex flex-col w-64 p-6 border-r border-white/5 space-y-2 pt-8">
            <SideBtn icon={<Home size={20}/>} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SideBtn icon={<List size={20}/>} label="Task Operations" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
            <SideBtn icon={<Users size={20}/>} label="Network Data" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
            <SideBtn icon={<Gem size={20}/>} label="Portfolios" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
            <SideBtn icon={<User size={20}/>} label="Account" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
          </aside>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
            {activeTab === 'home' && <HomeTab user={user} onAction={handleAction} onUnlockVip={handleVipUnlock} />}
            {activeTab === 'task' && <TaskTab user={user} onClaimDaily={handleClaim} />}
            {activeTab === 'team' && <TeamTab user={user} />}
            {activeTab === 'vip' && <VipTab user={user} onUnlockVip={handleVipUnlock} />}
            {activeTab === 'me' && <ProfileTab user={user} onAction={handleAction} onLogout={handleLogout} />}
          </main>
        </div>

        <nav className="md:hidden fixed bottom-0 w-full bg-[#0B132B]/90 backdrop-blur-2xl flex justify-between px-6 py-4 z-40 border-t border-white/5 pb-safe">
          <BottomBtn icon={<Home size={24}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <BottomBtn icon={<List size={24}/>} label="Tasks" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
          <BottomBtn icon={<Users size={24}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <BottomBtn icon={<Gem size={24}/>} label="VIP" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
          <BottomBtn icon={<User size={24}/>} label="Profile" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
        </nav>
      </div>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
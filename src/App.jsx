import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, List, Users, Gem, User, Eye, Lock, Mail, ChevronRight, LogOut, KeyRound, ArrowLeft, Copy, Activity, Zap, AlertCircle, CheckCircle2, Loader2, History, Clock } from 'lucide-react';
import { supabase } from './supabaseClient'; // 🟢 Supabase Import

// ==========================================
// 1. BUSINESS CONFIGURATION (VIP Logic)
// ==========================================
const VIP_TIERS = {
  0: { name: "Non-VIP", cost: 0, daily: 0, minWithdraw: 50 },
  1: { name: "VIP 1", cost: 15, daily: 6, minWithdraw: 10 },
  2: { name: "VIP 2", cost: 45, daily: 15, minWithdraw: 20 },
  3: { name: "VIP 3", cost: 120, daily: 45, minWithdraw: 50 },
  4: { name: "VIP 4", cost: 350, daily: 120, minWithdraw: 100 },
  5: { name: "VIP 5", cost: 800, daily: 300, minWithdraw: 200 },
  6: { name: "VIP 6", cost: 1500, daily: 650, minWithdraw: 500 },
  7: { name: "VIP 7", cost: 3000, daily: 1400, minWithdraw: 1000 },
  8: { name: "VIP 8", cost: 6000, daily: 3000, minWithdraw: 2000 }
};

const getHighestVip = (user) => {
  if (!user || !user.ownedVips) return user?.vipLevel || 0;
  const vips = Object.keys(user.ownedVips).map(Number);
  return vips.length > 0 ? Math.max(...vips) : 0;
};

// ==========================================
// 2. REUSABLE UI COMPONENTS
// ==========================================
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
// 4. PLISIO AUTOMATIC DEPOSIT & WITHDRAWAL
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

const WithdrawalScreen = ({ user, onClose, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [secPassword, setSecPassword] = useState('');
  const highestVip = getHighestVip(user);
  const vipConfig = VIP_TIERS[highestVip] || VIP_TIERS[0];

  const handleWithdrawRequest = () => {
    if(!amount || parseFloat(amount) < vipConfig.minWithdraw) return alert(`Minimum Withdrawal for your VIP is $${vipConfig.minWithdraw} USDT`);
    if(parseFloat(amount) > user.balance) return alert("Insufficient Balance!");
    if(secPassword !== user.secPassword) return alert("Incorrect Fund Password!");
    if(!address) return alert("Please enter receiving address!");
    
    // 🟢 PASSING BOTH AMOUNT AND ADDRESS FOR HISTORY
    onWithdraw(parseFloat(amount), address);
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-50 bg-[#0B132B] text-white overflow-y-auto">
      <div className="bg-[#111A3A] p-5 flex items-center justify-between border-b border-white/5 sticky top-0"><button onClick={onClose}><ArrowLeft size={20} /></button><h2 className="font-bold">Fund Withdrawal</h2><div className="w-10"></div></div>
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-[#1A264F] to-[#111A3A] p-8 rounded-3xl border border-white/5">
          <p className="text-slate-400 text-sm">Available Balance</p>
          <p className="text-4xl font-bold">${parseFloat(user?.balance || 0).toFixed(2)} USDT</p>
          <p className="text-teal-400 text-xs mt-3 flex items-center gap-1"><AlertCircle size={12}/> Your limit: Min ${vipConfig.minWithdraw} for {vipConfig.name}</p>
        </div>
        <div className="space-y-5">
          <input type="number" placeholder="Withdrawal Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#111A3A] border border-white/5 p-4 rounded-xl text-white" />
          <input type="text" placeholder="TRC20 / BEP20 Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#111A3A] border border-white/5 p-4 rounded-xl text-white" />
          <AuthInput icon={KeyRound} type="password" placeholder="Fund Password" value={secPassword} onChange={(e) => setSecPassword(e.target.value)} />
          <button onClick={handleWithdrawRequest} className="w-full bg-teal-400 text-[#0B132B] font-bold py-4 rounded-xl">Process Withdrawal</button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 5. NETWORK ACTIVITY
// ==========================================
const LiveMemberActivity = () => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const names = ['alex', 'whale', 'trade', 'king', 'pro', 'max', 'mike'];
    let gen = [];
    for (let i = 0; i < 10; i++) {
      gen.push({ type: Math.random() > 0.5 ? 'recharge' : 'withdraw', user: `${names[Math.floor(Math.random()*names.length)]}${Math.floor(Math.random()*999)}***`, amount: (Math.random()*250 + 50).toFixed(2) });
    }
    setActivities(gen);
  }, []);
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4"><div className="h-3 w-3 rounded-full bg-red-500 animate-ping"></div><h3 className="font-bold">Real-time Activity</h3></div>
      <div className="h-[180px] overflow-hidden relative rounded-2xl bg-[#111A3A]/60 border border-white/5">
        <motion.div animate={{ y: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 15, repeat: Infinity }} className="p-4 space-y-3">
          {[...activities, ...activities].map((act, i) => (
            <div key={i} className="bg-white/[0.03] p-3 rounded-xl flex justify-between items-center border border-white/5">
              <div className="flex items-center gap-3"><Activity size={14} className={act.type === 'recharge' ? 'text-teal-400' : 'text-blue-400'}/><p className="text-sm font-mono">{act.user}</p></div>
              <span className={act.type === 'recharge' ? 'text-teal-400' : 'text-white'}>${act.amount}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// 6. DASHBOARD TABS
// ==========================================
const HomeTab = ({ user, onAction, onUnlockVip }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="w-full h-56 bg-gradient-to-br from-[#162758] to-[#0A1128] rounded-3xl flex flex-col justify-center px-8 border border-white/10 mb-8">
      <span className="text-teal-400 font-bold text-sm tracking-widest uppercase mb-2">Global Enterprise</span>
      <h2 className="text-3xl font-black text-white leading-tight">Elite Trading<br/>Portfolio.</h2>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-10">
      {['Recharge', 'Withdraw', 'Invite'].map((item, i) => (
        <div key={i} onClick={() => onAction(item === 'Invite' ? 'Invite Friends' : item)} className="flex flex-col items-center gap-3 p-4 bg-[#111A3A]/80 rounded-2xl border border-white/5 hover:border-teal-500/50 cursor-pointer">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">{i === 0 ? '+' : i === 1 ? '↑' : <Users size={20}/>}</div>
          <span className="text-[10px] font-bold uppercase">{item}</span>
        </div>
      ))}
    </div>
    <LiveMemberActivity />
    <h3 className="text-lg font-bold mb-6">Investment Hall</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {Object.entries(VIP_TIERS).map(([level, data]) => level > 0 && (
        <div key={level} onClick={() => onUnlockVip(level, data.cost)} className="bg-[#111A3A]/80 p-5 rounded-3xl border border-white/5 hover:border-teal-500/50 cursor-pointer relative">
          <div className="w-full h-24 bg-[#0B132B] rounded-2xl flex flex-col items-center justify-center mb-4 border border-white/5">
            <UsdtIcon />
            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded font-bold">VIP {level}</div>
            {user?.ownedVips && user.ownedVips[level] && <div className="absolute bottom-2 right-2 bg-teal-500 text-white rounded-full p-1"><CheckCircle2 size={12}/></div>}
          </div>
          <p className="text-[10px] text-slate-500 uppercase mb-1">Required Fund</p>
          <p className="text-lg font-black">${data.cost}.00</p>
        </div>
      ))}
    </div>
  </motion.div>
);

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
  }, [ownedVips]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      {vipKeys.length === 0 ? (
        <div className="bg-[#111A3A]/50 rounded-3xl border border-white/5 p-16 text-center">
          <Activity size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">No Active Nodes</h3>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4">Your Trading Nodes</h3>
          {vipKeys.map(level => {
            const status = timers[level] || "Loading...";
            const isReady = status === "Available Now";
            const isExpired = status === "Expired";
            
            return (
              <div key={level} className={`p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 ${isExpired ? 'bg-red-500/10' : 'bg-[#111A3A]'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B132B] rounded-xl flex justify-center items-center"><span className="text-yellow-500 font-bold">V{level}</span></div>
                  <div><p className="font-bold">VIP {level} Node</p><p className="text-sm text-slate-400">Yield: ${VIP_TIERS[level].daily}/day</p></div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="bg-[#0B132B] px-4 py-2 rounded-lg text-teal-400 font-mono text-sm flex items-center gap-2">{isExpired ? <AlertCircle size={14}/> : <Clock size={14}/>} {status}</div>
                  <button disabled={!isReady || isExpired} onClick={() => onClaimDaily(level, VIP_TIERS[level].daily)} className={`px-4 py-2 rounded-xl font-bold ${isReady ? 'bg-teal-400 text-black' : 'bg-slate-800 text-slate-500'}`}>
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
      <div className="bg-gradient-to-br from-[#162758] to-[#0A1128] p-8 rounded-3xl mb-8 relative border border-white/5">
        <p className="text-sm text-teal-400 font-semibold mb-2">Multi-Tier Partner Network</p>
        <p className="text-xs text-slate-400 mb-6 bg-white/5 p-3 rounded-lg border border-white/5">
          🚀 <strong className="text-white">Level 1:</strong> Earn 7% on direct referrals' deposits.<br/>
          🚀 <strong className="text-white">Level 2:</strong> Earn 3% on indirect team deposits.
        </p>
        <div className="bg-[#0B132B] p-4 rounded-2xl flex justify-between items-center border border-white/5">
          <div className="overflow-hidden mr-4"><p className="text-xs text-slate-500">Your Invite Link</p><p className="text-sm font-bold truncate text-teal-400">{referralLink}</p></div>
          <button onClick={() => { navigator.clipboard.writeText(referralLink); alert('Link Copied!'); }} className="bg-white/10 p-3 rounded-xl hover:bg-white/20"><Copy size={18} className="text-white"/></button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111A3A] p-6 rounded-3xl border border-white/5"><p className="text-slate-400 text-sm">Direct Team</p><p className="text-3xl font-bold">{user?.my_referrals?.length || 0}</p></div>
        <div className="bg-[#111A3A] p-6 rounded-3xl border border-white/5"><p className="text-slate-400 text-sm">Referral Income</p><p className="text-3xl text-teal-400 font-bold">${parseFloat(user?.refer_balance || 0).toFixed(2)}</p></div>
      </div>

      <h3 className="font-bold text-lg mb-4">Direct Referrals</h3>
      <div className="space-y-3">
        {user?.my_referrals && user.my_referrals.length > 0 ? user.my_referrals.map((ref, idx) => (
          <div key={idx} className="bg-[#111A3A] p-4 rounded-2xl flex justify-between items-center border border-white/5">
            <div className="flex items-center gap-3"><Users size={16} className="text-teal-400"/><span className="font-mono text-sm">{ref.email}</span></div>
            <span className="text-xs text-slate-500">{new Date(ref.date).toLocaleDateString()}</span>
          </div>
        )) : <p className="text-center text-slate-500 py-4">No referrals yet.</p>}
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
        <div key={level} className={`bg-[#111A3A] rounded-3xl p-6 flex items-center gap-6 border ${isOwned ? 'border-teal-500/50' : 'border-white/5'}`}>
          <div className="w-20 h-20 bg-[#0B132B] rounded-2xl flex flex-col justify-center items-center"><UsdtIcon sizeClass="w-8 h-8"/><span className="text-yellow-500 text-[10px] mt-1 font-bold">Tier {level}</span></div>
          <div className="flex-1">
            <p className="font-bold">{d.name} Package</p>
            <p className="text-teal-400 font-bold">${d.daily}/day <span className="text-slate-500 text-[10px] font-normal">(30 Days)</span></p>
            <p className="text-slate-500 text-xs mt-1">Unlock: ${d.cost}</p>
          </div>
          <button disabled={isOwned} onClick={() => onUnlockVip(level, d.cost)} className={`px-6 py-2 rounded-xl font-bold ${isOwned ? 'bg-slate-800 text-slate-500' : 'bg-teal-400 text-black'}`}>{isOwned ? "Active" : "Buy"}</button>
        </div>
      );
    })}
  </motion.div>
);

const ProfileTab = ({ user, onAction, onLogout }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="bg-[#111A3A] p-8 rounded-3xl text-center mb-6 border border-white/5">
      <div className="w-20 h-20 bg-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg shadow-teal-500/20">👤</div>
      <p className="text-xl font-bold text-white">{user?.email}</p>
      
      <div className="bg-[#0B132B] rounded-2xl p-6 flex justify-between mt-6 border border-white/5">
        <div className="w-1/2"><p className="text-xs text-slate-500">Main Balance</p><p className="text-2xl font-bold text-white">${parseFloat(user?.balance || 0).toFixed(2)}</p></div>
        <div className="w-1/2 border-l border-white/5 pl-4"><p className="text-xs text-slate-500">Referral Wallet</p><p className="text-2xl font-bold text-teal-400">${parseFloat(user?.refer_balance || 0).toFixed(2)}</p></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
         <button onClick={() => onAction('Recharge')} className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold py-3.5 rounded-xl"><Zap size={18}/> Deposit</button>
         <button onClick={() => onAction('Withdraw')} className="flex items-center justify-center gap-2 bg-white/5 py-3.5 rounded-xl border border-white/10 hover:bg-white/10"><ArrowLeft size={18}/> Withdraw</button>
      </div>
    </div>

    {/* 🟢 FULL TRANSACTION HISTORY W/ STATUS */}
    <div className="bg-[#111A3A] p-6 rounded-3xl mb-6 border border-white/5">
      <h3 className="font-bold flex items-center gap-2 mb-4"><History size={18} className="text-teal-400"/> Transaction History</h3>
      <div className="space-y-3">
        {user?.tx_history && user.tx_history.length > 0 ? [...user.tx_history].reverse().slice(0, 15).map((tx, idx) => (
          <div key={idx} className="flex justify-between items-center bg-[#0B132B] p-3 rounded-xl border border-white/5">
            <div>
               <p className="text-sm font-bold text-white">{tx.type}</p>
               <p className="text-[10px] text-slate-400 mt-0.5">
                 {new Date(tx.date).toLocaleString()} 
                 {/* 🟢 PENDING STATUS DISPLAY */}
                 {tx.status && <span className="text-yellow-500 ml-2 bg-yellow-500/10 px-1.5 py-0.5 rounded font-bold">[{tx.status}]</span>}
               </p>
            </div>
            <span className={`font-bold ${tx.amount > 0 ? 'text-teal-400' : 'text-red-400'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount} USDT</span>
          </div>
        )) : <p className="text-sm text-slate-500 text-center">No history found.</p>}
      </div>
    </div>

    <div onClick={onLogout} className="bg-[#111A3A] p-5 rounded-2xl text-red-400 flex justify-between items-center cursor-pointer border border-white/5 hover:bg-red-500/10"><div className="flex items-center gap-3"><LogOut size={20}/> Secure Disconnect</div></div>
  </motion.div>
);

// ==========================================
// 7. MAIN DASHBOARD LAYOUT & PROTECTED ROUTE 
// ==========================================
const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('userEmail') ? children : <Navigate to="/login" replace />;
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCloudData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return navigate('/login');
      
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      
      if (data) {
        setUser({
          email: data.email,
          balance: data.balance || 0,
          refer_balance: data.refer_balance || 0,
          totalRecharge: data.total_recharge || 0,
          ownedVips: data.owned_vips || {},
          secPassword: data.sec_password,
          referralCode: data.referral_code,
          referredBy: data.referred_by,
          teamSize: data.team_size || 0,
          teamRecharge: data.team_recharge || 0,
          my_referrals: data.my_referrals || [],
          tx_history: data.tx_history || []
        });
      } else {
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    };
    fetchCloudData();
  }, [navigate, showRecharge]);

  const syncUserToCloud = async (updatedUser) => {
    setUser(updatedUser); 
    await supabase.from('users').update({
      balance: updatedUser.balance,
      owned_vips: updatedUser.ownedVips,
      tx_history: updatedUser.tx_history
    }).eq('email', updatedUser.email);
  };

  const handleVipUnlock = async (level, cost) => {
    const owned = user.ownedVips || {};
    if (owned[level] && owned[level].expiry > Date.now()) return alert(`You already have an active VIP ${level}!`);
    if (user.balance < cost) return setShowRecharge(true);
    
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    // 🟢 VIP PURCHASE HISTORY ENTRY
    const historyEntry = { type: `Purchased VIP ${level}`, amount: -cost, date: new Date().toISOString() };
    
    const updated = { 
      ...user, 
      balance: user.balance - cost, 
      ownedVips: { ...owned, [level]: { lastClaimTime: null, expiry: Date.now() + thirtyDaysMs } },
      tx_history: [...(user.tx_history || []), historyEntry]
    };
    await syncUserToCloud(updated);
    alert(`Successfully Acquired VIP ${level}. Valid for 30 Days.`);
  };

  const handleClaim = async (level, amt) => {
    const owned = user.ownedVips || {};
    
    // 🟢 TASK YIELD HISTORY ENTRY
    const historyEntry = { type: `Task Yield VIP ${level}`, amount: amt, date: new Date().toISOString() };

    const updated = { 
      ...user, 
      balance: user.balance + amt, 
      ownedVips: { ...owned, [level]: { ...owned[level], lastClaimTime: Date.now() } },
      tx_history: [...(user.tx_history || []), historyEntry]
    };
    await syncUserToCloud(updated);
    alert(`Success! $${amt} USDT generated.`);
  };

  // 🟢 WITHDRAWAL PENDING LOGIC (24 HOURS)
  const handleWithdrawal = async (amt, address) => {
    const historyEntry = { 
      type: `Withdrawal to ${address.substring(0,6)}...`, 
      amount: -amt, 
      date: new Date().toISOString(),
      status: "Pending (24h)" // 🟢 Added pending status specifically for withdrawals
    };
    
    const updated = { ...user, balance: user.balance - amt, tx_history: [...(user.tx_history || []), historyEntry] };
    await syncUserToCloud(updated);
    setShowWithdrawal(false);
    
    // 🟢 Inform User
    alert('Withdrawal request submitted successfully! Your funds will be processed and transferred within 24 hours.');
  };

  const handleLogout = () => { localStorage.removeItem('userEmail'); navigate('/login'); };
  const handleAction = (type) => { type === 'Withdraw' ? setShowWithdrawal(true) : type === 'Recharge' ? setShowRecharge(true) : setActiveTab('team'); };

  if (!user) return <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-teal-400"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <>
      <AnimatePresence>
        {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} userEmail={user.email} />}
        {showWithdrawal && <WithdrawalScreen user={user} onClose={() => setShowWithdrawal(false)} onWithdraw={handleWithdrawal} />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-black text-slate-200">
        <header className="bg-[#0B132B]/80 p-4 flex justify-between items-center border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-3"><Zap size={20} className="text-teal-400 fill-teal-400" /><span className="font-bold">Thunder Platform</span></div>
        </header>

        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <aside className="hidden md:flex flex-col w-64 p-6 border-r border-white/5">
            <SideBtn icon={<Home size={20}/>} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SideBtn icon={<List size={20}/>} label="Tasks" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
            <SideBtn icon={<Users size={20}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
            <SideBtn icon={<Gem size={20}/>} label="VIP" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
            <SideBtn icon={<User size={20}/>} label="Account" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
          </aside>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {activeTab === 'home' && <HomeTab user={user} onAction={handleAction} onUnlockVip={handleVipUnlock} />}
            {activeTab === 'task' && <TaskTab user={user} onClaimDaily={handleClaim} />}
            {activeTab === 'team' && <TeamTab user={user} />}
            {activeTab === 'vip' && <VipTab user={user} onUnlockVip={handleVipUnlock} />}
            {activeTab === 'me' && <ProfileTab user={user} onAction={handleAction} onLogout={handleLogout} />}
          </main>
        </div>

        <nav className="md:hidden fixed bottom-0 w-full bg-[#0B132B] flex justify-between px-6 py-4 z-40 border-t border-white/5">
          <BottomBtn icon={<Home size={22}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <BottomBtn icon={<List size={22}/>} label="Tasks" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
          <BottomBtn icon={<Users size={22}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <BottomBtn icon={<Gem size={22}/>} label="VIP" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
          <BottomBtn icon={<User size={22}/>} label="Account" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
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
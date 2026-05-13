import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, List, Users, Gem, User, Eye, Lock, Mail, ChevronRight, LogOut, KeyRound, ArrowLeft, QrCode, Copy, ShieldCheck, Activity, Zap, Clock, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

// ==========================================
// 1. VIP CONFIGURATION
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
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('usersDB')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('activeSession', JSON.stringify(user));
      navigate('/dashboard');
    } else setError('Authentication failed.');
  };

  return (
    <AuthLayout>
      <div className="flex justify-center mb-8"><div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.3)]"><Zap className="text-white fill-white" size={32} /></div></div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white tracking-tight">Thunder Platform</h2>
      {error && <p className="text-red-400 text-sm text-center mb-6 bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-5">
        <AuthInput icon={Mail} type="email" placeholder="Corporate Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthInput icon={Lock} type="password" placeholder="Access Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-[#0B132B] font-bold py-4 rounded-xl mt-4">Secure Sign In</motion.button>
        <p className="text-center text-slate-400 text-sm mt-6">New to Thunder? <span onClick={() => navigate('/register')} className="text-teal-400 font-semibold cursor-pointer">Register Now</span></p>
      </form>
    </AuthLayout>
  );
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState({ email: '', password: '', secPassword: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem('usersDB')) || [];
    if (users.find(u => u.email === formData.email)) return setError('Account exists.');
    const refCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (formData.inviteCode) {
      const rIdx = users.findIndex(u => u.referralCode === formData.inviteCode);
      if (rIdx !== -1) users[rIdx].teamSize = (users[rIdx].teamSize || 0) + 1;
      else return setError('Invalid Code.');
    }

    const newUser = { 
      ...formData, referralCode: refCode, balance: 0, 
      ownedVips: {}, totalRecharge: 0, teamSize: 0, teamRecharge: 0, 
      referredBy: formData.inviteCode || null
    };
    users.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(users));
    setSuccess('Registration successful!');
    setTimeout(() => navigate('/login'), 1500);
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
        <AuthInput icon={Users} type="text" placeholder="Invite Code" value={formData.inviteCode} onChange={(e) => setFormData({...formData, inviteCode: e.target.value})} isRequired={false} />
        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-teal-400 text-[#0B132B] font-bold py-4 rounded-xl mt-4">Complete</motion.button>
        <p className="text-center text-slate-400 text-sm mt-6">Already a member? <span onClick={() => navigate('/login')} className="text-teal-400 font-semibold cursor-pointer">Sign In</span></p>
      </form>
    </AuthLayout>
  );
};

// ==========================================
// 4. DEPOSIT MODAL (WITH TON & MULTI-CHAIN)
// ==========================================
const RechargeModal = ({ onClose, onRecharge }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('USDT (TON)');
  const [txId, setTxId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 👇 SABHI WALLET ADDRESSES YAHAN HAIN 👇
  const ADMIN_WALLETS = {
    "USDT (TON)": "UQBK2vhnxCbEVLhdjmaQMZiH6LHJi_o3jjf21r4lT4IUai5R", 
    "TRC20": "YAHAN_APNA_ASLI_TRON_ADDRESS_DAALEIN", // Tron address 'T' se shuru hona chahiye
    "BEP20": "0x48bebd0250244c531e4e3558c77fa7b8d7b33963"
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address Copied!");
  };

  const handleVerify = async () => {
    if(!txId || txId.length < 10) return setErrorMsg("Please enter a valid Transaction Hash (TxID)");
    
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch('/.netlify/functions/verifyTx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: txId,
          network: network,
          expectedAmount: parseFloat(amount),
          adminAddress: ADMIN_WALLETS[network]
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.isManual) {
            alert(result.message);
            onClose();
        } else {
            onRecharge(result.amount || parseFloat(amount));
        }
      } else {
        setErrorMsg(result.message || "Payment verification failed.");
      }
    } catch (error) {
      setErrorMsg("System Error. Make sure backend is pushed to GitHub.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/90 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95 }} className="bg-[#111A3A] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-6 text-center text-[#0B132B]">
          <h3 className="font-bold text-xl mb-1">Recharge Balance</h3>
          <p className="text-sm font-medium opacity-80">Secure Network Verification</p>
        </div>

        {isVerifying ? (
           <div className="p-12 flex flex-col items-center justify-center space-y-6">
              <Loader2 size={60} className="text-teal-400 animate-spin" />
              <h3 className="text-xl font-bold text-white text-center">Scanning Blockchain</h3>
              <p className="text-slate-400 text-sm text-center">Checking {network} for Hash: {txId.substring(0,8)}...</p>
           </div>
        ) : step === 1 ? (
          <div className="p-8 space-y-5">
            <div>
              <p className="text-slate-400 text-sm mb-2">Deposit Amount ($)</p>
              <input type="number" placeholder="Min $10" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0B132B] border border-white/10 p-4 rounded-xl text-white text-xl focus:border-teal-400 focus:outline-none" />
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Select Network</p>
              <div className="grid grid-cols-3 gap-2">
                {['USDT (TON)', 'TRC20', 'BEP20'].map((net) => (
                  <button 
                    key={net} 
                    onClick={() => setNetwork(net)}
                    className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${network === net ? 'bg-teal-500/20 border-teal-400 text-teal-400' : 'border-white/10 text-slate-400'}`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300">Cancel</button>
              <button onClick={() => { if(amount >= 10) setStep(2); else alert('Minimum deposit is $10'); }} className="flex-1 py-3.5 rounded-xl bg-teal-400 text-[#0B132B] font-bold">Continue</button>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-5">
            <div className="text-center mb-2">
              <p className="text-slate-400 text-sm mb-1">Transfer Exactly</p>
              <p className="text-3xl font-black text-white">${amount}.00 <span className="text-sm text-teal-400">USDT</span></p>
            </div>
            
            <div className="bg-[#0B132B] p-4 rounded-xl border border-white/5 space-y-3">
              <p className="text-xs text-slate-400 uppercase">Your {network} Deposit Address</p>
              <p className="text-white text-[10px] break-all font-mono bg-white/5 p-2 rounded-lg">{ADMIN_WALLETS[network]}</p>
              <button onClick={() => handleCopy(ADMIN_WALLETS[network])} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-lg text-teal-400 text-sm font-bold transition-colors">
                <Copy size={16} /> Copy Address
              </button>
            </div>
            
            {errorMsg && <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-[10px] break-words text-center font-bold">{errorMsg}</div>}

            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 text-center px-4">Pay using any wallet, then paste the Hash (TxID) below.</p>
              <input type="text" placeholder="Paste Hash / TxID here..." value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full bg-[#111A3A] border border-teal-500/30 p-4 rounded-xl text-white text-sm focus:border-teal-400 focus:outline-none" />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300">Back</button>
              <button onClick={handleVerify} className="flex-1 py-3.5 rounded-xl bg-teal-400 text-[#0B132B] font-bold">Check Status</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const WithdrawalScreen = ({ user, onClose, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [secPassword, setSecPassword] = useState('');
  
  const highestVip = getHighestVip(user);
  const vipConfig = VIP_TIERS[highestVip] || VIP_TIERS[0];

  const handleWithdrawRequest = () => {
    if(!amount || parseFloat(amount) < vipConfig.minWithdraw) return alert(`Min Withdraw $${vipConfig.minWithdraw} (${vipConfig.name})`);
    if(parseFloat(amount) > user.balance) return alert("Insufficient Balance!");
    if(secPassword !== user.secPassword) return alert("Incorrect Fund Password!");
    onWithdraw(parseFloat(amount));
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-50 bg-[#0B132B] text-white overflow-y-auto">
      <div className="bg-[#111A3A] p-5 flex items-center justify-between border-b border-white/5 sticky top-0"><button onClick={onClose}><ArrowLeft size={20} /></button><h2 className="font-bold">Withdrawal</h2><div className="w-10"></div></div>
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-[#1A264F] to-[#111A3A] p-8 rounded-3xl border border-white/5">
          <p className="text-slate-400 text-sm">Balance</p>
          <p className="text-4xl font-bold">${parseFloat(user?.balance || 0).toFixed(2)} USDT</p>
        </div>
        <div className="space-y-5">
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#111A3A] border border-white/5 p-4 rounded-xl text-white" />
          <input type="text" placeholder="Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#111A3A] border border-white/5 p-4 rounded-xl text-white" />
          <AuthInput icon={KeyRound} type="password" placeholder="Fund Password" value={secPassword} onChange={(e) => setSecPassword(e.target.value)} />
          <button onClick={handleWithdrawRequest} className="w-full bg-teal-400 text-[#0B132B] font-bold py-4 rounded-xl">Withdraw</button>
        </div>
      </div>
    </motion.div>
  );
};

const LiveMemberActivity = () => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const names = ['alex', 'whale', 'trade', 'king', 'pro', 'max', 'mike'];
    let gen = [];
    for (let i = 0; i < 10; i++) {
      gen.push({ 
        type: Math.random() > 0.5 ? 'recharge' : 'withdraw', 
        user: `${names[Math.floor(Math.random()*names.length)]}${Math.floor(Math.random()*999)}***`, 
        amount: (Math.random()*250 + 50).toFixed(2) 
      });
    }
    setActivities(gen);
  }, []);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4"><div className="h-3 w-3 rounded-full bg-red-500 animate-ping"></div><h3 className="font-bold">Live Network</h3></div>
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

const HomeTab = ({ user, onAction, onUnlockVip }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="w-full h-56 bg-gradient-to-br from-[#162758] to-[#0A1128] rounded-3xl flex flex-col justify-center px-8 border border-white/10 mb-8">
      <span className="text-teal-400 font-bold text-sm tracking-widest uppercase mb-2">Thunder Enterprise</span>
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
          <p className="text-[10px] text-slate-500 uppercase mb-1">Required</p>
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
        const lastClaim = ownedVips[level].lastClaimTime;
        if (!lastClaim) {
          newTimers[level] = "Available Now";
          return;
        }
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
          <h3 className="text-xl font-bold">No Active Nodes</h3>
          <p className="text-slate-400 text-sm">Acquire a VIP portfolio to start earning daily.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4">Trading Status</h3>
          {vipKeys.map(level => {
            const status = timers[level] || "Loading...";
            const isReady = status === "Available Now";
            return (
              <div key={level} className="bg-[#111A3A] p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                <div><p className="font-bold">VIP {level} Node</p><p className="text-sm text-teal-400">+${VIP_TIERS[level].daily} Daily</p></div>
                <button disabled={!isReady} onClick={() => onClaimDaily(level, VIP_TIERS[level].daily)} className={`px-6 py-3 rounded-xl font-bold ${isReady ? 'bg-teal-400 text-black' : 'bg-slate-800 text-slate-500'}`}>
                  {isReady ? 'Claim' : status}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const TeamTab = ({ user }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="bg-[#111A3A] p-8 rounded-3xl border border-white/10 mb-8">
      <p className="text-sm text-slate-400 mb-2">Referral Code</p>
      <div className="bg-[#0B132B] p-4 rounded-2xl flex justify-between items-center">
        <p className="text-2xl font-black tracking-widest">{user?.referralCode || '000000'}</p>
        <button onClick={() => alert('Copied!')} className="p-3 bg-white/5 rounded-xl"><Copy size={18} className="text-teal-400"/></button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#111A3A]/80 p-6 rounded-3xl border border-white/5"><p className="text-sm text-slate-400 mb-2">Team Size</p><p className="text-3xl font-bold">{user?.teamSize || 0}</p></div>
      <div className="bg-[#111A3A]/80 p-6 rounded-3xl border border-white/5"><p className="text-sm text-slate-400 mb-2">Earnings</p><p className="text-3xl font-bold text-teal-400">${parseFloat(user?.teamRecharge || 0).toFixed(2)}</p></div>
    </div>
  </motion.div>
);

const VipTab = ({ user, onUnlockVip }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 space-y-4">
    {Object.entries(VIP_TIERS).map(([level, d]) => level > 0 && (
        <div key={level} className="bg-[#111A3A]/80 rounded-3xl border border-white/5 p-6 flex justify-between items-center">
          <div><p className="text-white font-bold text-lg">VIP {level}</p><p className="text-teal-400 text-sm">Daily: ${d.daily}</p><p className="text-slate-500 text-xs mt-1">Price: ${d.cost}</p></div>
          <button disabled={user?.ownedVips?.[level]} onClick={() => onUnlockVip(level, d.cost)} className={`px-6 py-3 rounded-xl font-bold ${user?.ownedVips?.[level] ? 'bg-slate-800 text-slate-500' : 'bg-white/5 text-teal-400 border border-teal-500/20'}`}>
            {user?.ownedVips?.[level] ? "Active" : "Unlock"}
          </button>
        </div>
    ))}
  </motion.div>
);

const ProfileTab = ({ user, onAction, onLogout }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-2xl mx-auto">
    <div className="bg-[#111A3A]/80 p-8 rounded-3xl text-center border border-white/5 mb-6">
      <div className="w-20 h-20 bg-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">👤</div>
      <p className="text-xl font-bold">{user?.email}</p>
      <div className="bg-[#0B132B] rounded-2xl p-6 flex justify-between mt-6">
        <div><p className="text-xs text-slate-500 uppercase">Balance</p><p className="text-3xl font-bold">${parseFloat(user?.balance || 0).toFixed(2)}</p></div>
        <div className="pl-6 border-l border-white/5"><p className="text-xs text-slate-500 uppercase">Invested</p><p className="text-3xl font-bold">${parseFloat(user?.totalRecharge || 0).toFixed(2)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
         <button onClick={() => onAction('Recharge')} className="bg-teal-400 text-black font-bold py-3.5 rounded-xl">Recharge</button>
         <button onClick={() => onAction('Withdraw')} className="bg-white/5 text-white font-bold py-3.5 rounded-xl border border-white/10">Withdraw</button>
      </div>
    </div>
    <button onClick={onLogout} className="w-full bg-red-500/10 text-red-400 py-4 rounded-2xl flex items-center justify-center gap-3"><LogOut size={20}/> Disconnect</button>
  </motion.div>
);

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('activeSession')));
  const navigate = useNavigate();

  const syncUser = (updated) => {
    let all = JSON.parse(localStorage.getItem('usersDB'));
    const idx = all.findIndex(u => u.email === user.email);
    all[idx] = updated;
    localStorage.setItem('usersDB', JSON.stringify(all));
    localStorage.setItem('activeSession', JSON.stringify(updated));
    setUser(updated);
  };

  const handleRecharge = (amount) => {
    const updated = { ...user, balance: (user.balance || 0) + amount, totalRecharge: (user.totalRecharge || 0) + amount };
    syncUser(updated);
    setShowRecharge(false);
    alert(`Success! $${amount} added.`);
  };

  const handleVipUnlock = (level, cost) => {
    if (user.balance < cost) return setShowRecharge(true);
    const updated = { ...user, balance: user.balance - cost, ownedVips: { ...(user.ownedVips || {}), [level]: { lastClaimTime: null } } };
    syncUser(updated);
    alert(`VIP ${level} Active!`);
  };

  const handleClaim = (level, amt) => {
    const updated = { ...user, balance: user.balance + amt, ownedVips: { ...user.ownedVips, [level]: { lastClaimTime: Date.now() } } };
    syncUser(updated);
  };

  const handleAction = (type) => { if(type === 'Withdraw') setShowWithdrawal(true); else if(type === 'Recharge') setShowRecharge(true); else setActiveTab('team'); };

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence>
        {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} onRecharge={handleRecharge} />}
        {showWithdrawal && <WithdrawalScreen user={user} onClose={() => setShowWithdrawal(false)} onWithdraw={() => setShowWithdrawal(false)} />}
      </AnimatePresence>

      <header className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-2 font-bold text-xl"><Zap className="text-teal-400 fill-teal-400" /> Thunder</div>
        <div className="text-xs bg-teal-400/20 text-teal-400 px-3 py-1 rounded-full font-bold">SECURE</div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {activeTab === 'home' && <HomeTab user={user} onAction={handleAction} onUnlockVip={handleVipUnlock} />}
        {activeTab === 'task' && <TaskTab user={user} onClaimDaily={handleClaim} />}
        {activeTab === 'team' && <TeamTab user={user} />}
        {activeTab === 'vip' && <VipTab user={user} onUnlockVip={handleVipUnlock} />}
        {activeTab === 'me' && <ProfileTab user={user} onAction={handleAction} onLogout={() => navigate('/login')} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 p-4 flex justify-between items-center md:hidden z-40">
        <BottomBtn icon={<Home size={22}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <BottomBtn icon={<List size={22}/>} label="Tasks" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
        <BottomBtn icon={<Users size={22}/>} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
        <BottomBtn icon={<Gem size={22}/>} label="VIP" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
        <BottomBtn icon={<User size={22}/>} label="Profile" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
      </nav>
    </div>
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
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
// 4. MULTI-NETWORK DEPOSIT MODAL (NO KYC)
// ==========================================
const RechargeModal = ({ onClose, onRecharge }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [txId, setTxId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 👇 YAHAN AAPKE PERSONAL WALLET ADDRESS HAIN 👇
  const ADMIN_WALLETS = {
    "TRC20": "UQBK2vhnxCbEVLhdjmaQMZiH6LHJi_o3jjf21r4lT4IUai5R", // Yahan apna TRC20 address daalein
    "BEP20": "0x48bebd0250244c531e4e3558c77fa7b8d7b33963", // Aapka diya gaya BEP20 address
    "BTC": "YOUR_BITCOIN_ADDRESS_HERE" // Yahan apna BTC address daalein
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address Copied! Please send exact amount to this address.");
  };

  const handleVerify = async () => {
    if(!txId || txId.length < 10) return setErrorMsg("Please enter a valid Transaction Hash (TxID)");
    
    setIsVerifying(true);
    setErrorMsg('');

    try {
      // Netlify Backend ko Request bhejna
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
            // BEP20 ya BTC ke liye alert
            alert(result.message);
            onClose();
        } else {
            // TRC20 Auto Add
            onRecharge(result.amount || parseFloat(amount));
        }
      } else {
        setErrorMsg(result.message || "Payment verification failed.");
      }
    } catch (error) {
      setErrorMsg("System Error during verification. Make sure backend is deployed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B]/90 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95 }} className="bg-[#111A3A] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-600 to-teal-400 p-6 text-center text-[#0B132B]">
          <h3 className="font-bold text-xl mb-1">Deposit Crypto</h3>
          <p className="text-sm font-medium opacity-80">Direct Wallet Transfer</p>
        </div>

        {isVerifying ? (
           <div className="p-12 flex flex-col items-center justify-center space-y-6">
              <Loader2 size={60} className="text-teal-400 animate-spin" />
              <h3 className="text-xl font-bold text-white text-center">Verifying Transaction</h3>
              <p className="text-slate-400 text-sm text-center">Scanning {network} blockchain for your payment...</p>
           </div>
        ) : step === 1 ? (
          <div className="p-8 space-y-5">
            <div>
              <p className="text-slate-400 text-sm mb-2">Deposit Amount (USD)</p>
              <input type="number" placeholder="Min $10" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0B132B] border border-white/10 p-4 rounded-xl text-white text-xl focus:border-teal-400 focus:outline-none" />
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Select Network</p>
              <div className="grid grid-cols-3 gap-2">
                {['TRC20', 'BEP20', 'BTC'].map((net) => (
                  <button 
                    key={net} 
                    onClick={() => setNetwork(net)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${network === net ? 'bg-teal-500/20 border-teal-400 text-teal-400' : 'border-white/10 text-slate-400 hover:border-white/30'}`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300">Cancel</button>
              <button onClick={() => { if(amount >= 10) setStep(2); else alert('Minimum deposit is $10'); }} className="flex-1 py-3.5 rounded-xl bg-teal-400 text-[#0B132B] font-bold">Proceed</button>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-5">
            <div className="text-center mb-2">
              <p className="text-slate-400 text-sm mb-1">Send Exactly</p>
              <p className="text-3xl font-black text-white">${amount}.00 <span className="text-sm text-teal-400">{network === 'BTC' ? 'BTC' : 'USDT'}</span></p>
            </div>
            
            <div className="bg-[#0B132B] p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                 <p className="text-xs text-slate-400 uppercase tracking-wider">Admin {network} Address</p>
                 <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">Network: {network}</span>
              </div>
              <p className="text-white text-sm break-all font-mono bg-white/5 p-2 rounded-lg">{ADMIN_WALLETS[network]}</p>
              <button onClick={() => handleCopy(ADMIN_WALLETS[network])} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-lg text-teal-400 text-sm font-bold transition-colors">
                <Copy size={16} /> Copy Address
              </button>
            </div>
            
            {errorMsg && <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs break-words text-center">{errorMsg}</div>}

            <div className="space-y-2">
              <p className="text-xs text-slate-400 text-center px-4">Pay using Binance/Trust Wallet, then paste your Transaction Hash (TxID) below.</p>
              <input type="text" placeholder="Paste TxID / Hash here..." value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full bg-[#111A3A] border border-teal-500/30 p-4 rounded-xl text-white text-sm focus:border-teal-400 focus:outline-none" />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300">Back</button>
              <button onClick={handleVerify} className="flex-1 py-3.5 rounded-xl bg-teal-400 text-[#0B132B] font-bold">Verify Funds</button>
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
    if(!amount || parseFloat(amount) < vipConfig.minWithdraw) return alert(`Minimum Withdrawal based on your Highest VIP (${vipConfig.name}) is $${vipConfig.minWithdraw} USDT`);
    if(parseFloat(amount) > user.balance) return alert("Insufficient Balance!");
    if(secPassword !== user.secPassword) return alert("Incorrect Fund Password!");
    onWithdraw(parseFloat(amount));
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
          <input type="text" placeholder="TRC20 Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#111A3A] border border-white/5 p-4 rounded-xl text-white" />
          <AuthInput icon={KeyRound} type="password" placeholder="Fund Password" value={secPassword} onChange={(e) => setSecPassword(e.target.value)} />
          <div className="bg-[#111A3A] p-5 rounded-2xl border border-white/5 flex justify-between items-center"><span className="text-slate-400">Received (2% Fee)</span><span className="text-2xl font-bold text-teal-400">${amount ? (amount * 0.98).toFixed(2) : '0.00'}</span></div>
          <button onClick={handleWithdrawRequest} className="w-full bg-teal-400 text-[#0B132B] font-bold py-4 rounded-xl">Process Withdrawal</button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 5. LIVE ACTIVITY
// ==========================================
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
// 6. DASHBOARD SCREENS
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

  const totalPotential = vipKeys.reduce((sum, key) => sum + VIP_TIERS[key].daily, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <div className="bg-gradient-to-r from-[#162758] to-[#111A3A] rounded-3xl p-8 flex justify-between border border-white/10 mb-8 shadow-xl">
        <div className="w-1/2 border-r border-white/10"><p className="text-sm text-slate-400">Active Nodes</p><p className="text-2xl font-bold mt-2">{vipKeys.length}</p></div>
        <div className="w-1/2 pl-8"><p className="text-sm text-slate-400">Max Daily Yield</p><p className="text-2xl font-bold mt-2 text-teal-400">${totalPotential} USDT</p></div>
      </div>
      
      {vipKeys.length === 0 ? (
        <div className="bg-[#111A3A]/50 rounded-3xl border border-white/5 p-16 text-center space-y-4">
          <Activity size={48} className="text-slate-600 mx-auto" />
          <h3 className="text-2xl font-bold">No Active Nodes</h3>
          <p className="text-slate-400 text-sm">Please acquire a VIP portfolio to start generating daily yield.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4">Your Trading Nodes</h3>
          {vipKeys.map(level => {
            const status = timers[level] || "Loading...";
            const isReady = status === "Available Now";
            const dailyAmt = VIP_TIERS[level].daily;

            return (
              <div key={level} className="bg-[#111A3A] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B132B] rounded-xl flex items-center justify-center border border-white/5"><span className="text-yellow-500 font-bold">V{level}</span></div>
                  <div><p className="font-bold text-lg">VIP {level} Node</p><p className="text-sm text-slate-400">Yield: ${dailyAmt} / day</p></div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-[#0B132B] py-2 px-4 rounded-lg border border-white/5 text-teal-400 font-mono text-sm flex-1 text-center">{status}</div>
                  <button 
                    disabled={!isReady} 
                    onClick={() => onClaimDaily(level, dailyAmt)} 
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${isReady ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-[#0B132B] hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    Claim ${dailyAmt}
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

const TeamTab = ({ user }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
    <div className="bg-gradient-to-br from-[#162758] to-[#0A1128] rounded-3xl p-8 text-white border border-white/10 mb-8 shadow-xl relative overflow-hidden">
      <Users className="absolute right-[-20px] bottom-[-20px] text-white/5 w-48 h-48" />
      <p className="text-sm text-teal-400 font-semibold tracking-wider uppercase mb-2">Partner Network</p>
      <p className="text-sm text-slate-300 mb-6 max-w-sm">Expand your network and earn up to 15% cumulative liquidity commission.</p>
      <div className="bg-[#0B132B] p-4 rounded-2xl flex items-center justify-between border border-white/5">
        <div><p className="text-xs text-slate-500 mb-1">Referral Code</p><p className="text-2xl font-black text-white tracking-widest">{user?.referralCode || '000000'}</p></div>
        <button onClick={() => alert('Copied!')} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"><Copy size={18} className="text-teal-400"/></button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#111A3A]/80 p-6 rounded-3xl border border-white/5"><p className="text-sm text-slate-400 mb-2">Network Size</p><p className="text-3xl font-bold text-white">{user?.teamSize || 0}</p></div>
      <div className="bg-[#111A3A]/80 p-6 rounded-3xl border border-white/5"><p className="text-sm text-slate-400 mb-2">Total Volume</p><p className="text-3xl font-bold text-teal-400">${parseFloat(user?.teamRecharge || 0).toFixed(2)}</p></div>
    </div>
  </motion.div>
);

const VipTab = ({ user, onUnlockVip }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 space-y-4">
    {Object.entries(VIP_TIERS).map(([level, d]) => {
      if (level == 0) return null;
      const isOwned = user?.ownedVips && user.ownedVips[level];

      return (
        <div key={level} className={`bg-[#111A3A]/80 rounded-3xl border ${isOwned ? 'border-teal-500/50' : 'border-white/5'} p-6 flex items-center gap-6 shadow-xl transition-all`}>
          <div className="w-20 h-20 bg-[#0B132B] rounded-2xl flex flex-col items-center justify-center relative">
             <UsdtIcon sizeClass="w-8 h-8 text-sm mb-2" />
             <span className="text-yellow-500 font-bold text-[10px] uppercase">Tier {level}</span>
             {isOwned && <div className="absolute -top-2 -right-2 bg-teal-500 rounded-full p-1"><CheckCircle2 size={14} className="text-white"/></div>}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-lg mb-1">{d.name} Package</p>
            <p className="text-slate-400 text-sm">Daily Yield: <span className="text-teal-400 font-bold">${d.daily}.00</span></p>
            <p className="text-slate-500 text-xs mt-1">Unlock Price: ${d.cost}.00</p>
          </div>
          <button 
            disabled={isOwned} 
            onClick={() => onUnlockVip(level, d.cost)} 
            className={`px-6 py-3 rounded-xl font-bold transition-all ${isOwned ? 'bg-slate-800 text-slate-400 border border-white/5' : 'bg-white/5 text-teal-400 border border-teal-500/20 hover:bg-teal-500 hover:text-[#0B132B]'}`}
          >
            {isOwned ? "Owned" : "Acquire"}
          </button>
        </div>
      );
    })}
  </motion.div>
);

const ProfileTab = ({ user, onAction, onLogout }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-2xl mx-auto">
    <div className="bg-[#111A3A]/80 p-8 rounded-3xl text-center border border-white/5 shadow-2xl mb-6 relative">
      <div className="w-20 h-20 bg-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg border-4 border-[#0B132B]">👤</div>
      <p className="text-xl text-white font-bold mb-1">{user?.email || 'User'}</p>
      <span className="text-[10px] text-[#0B132B] bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 rounded-full font-bold tracking-widest uppercase">VIP {getHighestVip(user)} NODE</span>
      
      <div className="bg-[#0B132B] rounded-2xl p-6 flex justify-between mt-6 border border-white/5">
        <div className="w-1/2"><p className="text-xs text-slate-500 uppercase">Total Assets</p><p className="text-3xl font-bold text-white">{parseFloat(user?.balance || 0).toFixed(2)}</p></div>
        <div className="w-1/2 pl-6 border-l border-white/5"><p className="text-xs text-slate-500 uppercase">Total Inflow</p><p className="text-3xl font-bold text-white">{parseFloat(user?.totalRecharge || 0).toFixed(2)}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
         <button onClick={() => onAction('Recharge')} className="bg-teal-400 text-[#0B132B] font-bold py-3.5 rounded-xl">Deposit</button>
         <button onClick={() => onAction('Withdraw')} className="bg-white/5 text-white font-bold py-3.5 rounded-xl border border-white/10">Withdraw</button>
      </div>
    </div>
    <div className="space-y-3">
      <div onClick={onLogout} className="bg-[#111A3A]/80 p-5 rounded-2xl flex justify-between items-center text-red-400 border border-white/5 hover:bg-red-500/10 cursor-pointer"><div className="flex items-center gap-4 font-medium"><LogOut size={20}/> Secure Disconnect</div><ChevronRight size={18} className="text-red-400/50"/></div>
    </div>
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
    let users = JSON.parse(localStorage.getItem('usersDB'));
    if (user.referredBy) {
      const rIdx = users.findIndex(u => u.referralCode === user.referredBy);
      if(rIdx !== -1) users[rIdx].teamRecharge = (users[rIdx].teamRecharge || 0) + amount;
      localStorage.setItem('usersDB', JSON.stringify(users));
    }
    const updated = { ...user, balance: user.balance + amount, totalRecharge: user.totalRecharge + amount };
    syncUser(updated);
    setShowRecharge(false);
    alert(`Verified! $${amount} has been added to your wallet.`);
  };

  const handleVipUnlock = (level, cost) => {
    const owned = user.ownedVips || {};
    if (owned[level]) return alert(`You already own VIP ${level}!`);
    if (user.balance < cost) return setShowRecharge(true);
    
    const updatedOwned = { ...owned, [level]: { lastClaimTime: null } };
    const updated = { ...user, balance: user.balance - cost, ownedVips: updatedOwned };
    
    syncUser(updated);
    alert(`Successfully Acquired VIP ${level}`);
  };

  const handleClaim = (level, amt) => {
    const owned = user.ownedVips || {};
    const updatedOwned = { ...owned, [level]: { ...owned[level], lastClaimTime: Date.now() } };
    const updated = { ...user, balance: user.balance + amt, ownedVips: updatedOwned };
    
    syncUser(updated);
    alert(`Success! $${amt} USDT generated from VIP ${level} node.`);
  };

  const handleWithdrawal = (amt) => {
    const updated = { ...user, balance: user.balance - amt };
    syncUser(updated);
    setShowWithdrawal(false);
    alert('Withdrawal request processing.');
  };

  const handleLogout = () => { localStorage.removeItem('activeSession'); navigate('/login'); };

  const handleAction = (actionType) => {
    if(actionType === 'Withdraw') setShowWithdrawal(true);
    else if(actionType === 'Recharge') setShowRecharge(true);
    else if(actionType === 'Invite Friends') setActiveTab('team');
  };

  return (
    <>
      <AnimatePresence>
        {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} onRecharge={handleRecharge} />}
        {showWithdrawal && <WithdrawalScreen user={user} onClose={() => setShowWithdrawal(false)} onWithdraw={handleWithdrawal} />}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0B132B] via-[#060B19] to-black text-slate-200">
        <header className="bg-[#0B132B]/80 backdrop-blur-xl p-4 flex justify-between items-center border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"><Zap size={20} className="text-white fill-white" /></div><span className="font-bold text-xl tracking-tight hidden md:block">Thunder Platform</span></div>
          <button className="bg-white/5 px-4 py-2 rounded-full text-xs font-bold border border-white/10 text-teal-400">SECURE NODE</button>
        </header>

        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <aside className="hidden md:flex flex-col w-64 p-6 border-r border-white/5 space-y-2 pt-8">
            <SideBtn icon={<Home size={20}/>} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SideBtn icon={<List size={20}/>} label="Task Operations" active={activeTab === 'task'} onClick={() => setActiveTab('task')} />
            <SideBtn icon={<Users size={20}/>} label="Network Data" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
            <SideBtn icon={<Gem size={20}/>} label="Portfolios" active={activeTab === 'vip'} onClick={() => setActiveTab('vip')} />
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

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B132B]/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-40 pb-safe">
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

const ProtectedRoute = ({ children }) => localStorage.getItem('activeSession') ? children : <Navigate to="/login" replace />;

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
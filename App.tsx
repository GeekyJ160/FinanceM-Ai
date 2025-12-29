
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Building2, 
  Gavel, 
  Bot, 
  Menu, 
  X,
  CreditCard,
  CheckCircle,
  CloudUpload,
  ArrowUpRight,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Activity,
  Clock,
  Mail,
  Target,
  ShieldAlert,
  Zap,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AiChat } from './components/AiChat';
import { UserData, Section } from './types';
import { analyzeDispute } from './services/geminiService';

// Initial Mock Data
const INITIAL_DATA: UserData = {
  creditScore: 682,
  activeDisputes: 7,
  taxSavings: 9437,
  businessPaydex: 78,
  creditHistory: [
    { month: 'Jul', score: 595 },
    { month: 'Aug', score: 618 },
    { month: 'Sep', score: 640 },
    { month: 'Oct', score: 665 },
    { month: 'Nov', score: 682 },
    { month: 'Dec', score: 712 },
  ],
  lastUpdated: new Date().toISOString()
};

function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>(INITIAL_DATA);
  
  // Dispute Letter State
  const [letterView, setLetterView] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('');
  const [copied, setCopied] = useState(false);

  // Dispute Wizard State
  const [disputeWizardOpen, setDisputeWizardOpen] = useState(false);
  const [disputeStep, setDisputeStep] = useState(1);
  const [userEmail, setUserEmail] = useState('hustler@financemonkey.ai');
  const [newDisputeData, setNewDisputeData] = useState({
    type: '609', 
    creditor: '',
    accountNumber: '',
    reason: 'Not mine',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiVerdict, setAiVerdict] = useState('');

  const DISPUTE_REASONS = [
    "Not mine / Identity Theft",
    "Inaccurate balance",
    "Account is too old (Obsolete)",
    "Never late on this account",
    "Duplicate reporting"
  ];

  // Letter Templates
  const LETTER_TEMPLATES = [
    {
      id: '609',
      title: '609/611 Hybrid Letter',
      desc: 'For obsolete/incorrect collections',
      icon: Trash2,
      probability: 94,
      content: `John Hustler
888 Savage Blvd, Penthouse 4
Miami, FL 33132
Email: {EMAIL}

{DATE}

Equifax Information Services LLC
P.O. Box 740256
Atlanta, GA 30374

RE: Verification of Account Attributes

To Whom It May Concern:

I am writing to dispute the following information in my file. I have verified with the original creditor that this account is obsolete and/or inaccurate.

Account Name: {ACCOUNT_NAME}
Account Number: {ACCOUNT_NUMBER}
Dispute Reason: {REASON}

Strategic Basis: {VERDICT}

Under the Fair Credit Reporting Act (FCRA), Section 609 (a)(1)(A), you are required by federal law to verify - through the physical verification of the original signed consumer contract - any and all accounts that you post on a credit report. Otherwise, anyone paying for your reporting services could trick you into posting a negative account on someone else's credit report which is negligent and a violation of federal law.

I demand to see the verifiable proof (an original consumer contract with my signature on it) that you have on file. If you do not have this, I demand that this account be removed from my credit report immediately.

Sincerely,

John Hustler`
    },
    {
      id: 'hipaa',
      title: 'HIPAA Medical Dispute',
      desc: 'Strict medical privacy laws',
      icon: Activity,
      probability: 88,
      content: `John Hustler
888 Savage Blvd, Penthouse 4
Miami, FL 33132
Email: {EMAIL}

{DATE}

TransUnion Consumer Solutions
P.O. Box 2000
Chester, PA 19016

RE: Medical Account Dispute - Violation of HIPAA Privacy

To Whom It May Concern:

I am writing to dispute the medical collection account listed below:

Provider: {PROVIDER_NAME}
Account Number: {ACCOUNT_NUMBER}
Dispute Reason: {REASON}

Strategic Basis: {VERDICT}

The Health Insurance Portability and Accountability Act (HIPAA) protects my medical privacy. The reporting of this medical account on my credit report implies a release of my protected health information to a third party (you, the credit bureau) without my explicit written authorization for this specific purpose.

I have not authorized the release of my medical records or payment history to credit reporting agencies. Therefore, the presence of this account on my credit report is a violation of my HIPAA rights.

Please remove this account immediately.

Sincerely,

John Hustler`
    },
    {
      id: 'goodwill',
      title: 'Goodwill Adjustment',
      desc: 'For late payments removal',
      icon: Clock,
      probability: 65,
      content: `John Hustler
888 Savage Blvd, Penthouse 4
Miami, FL 33132
Email: {EMAIL}

{DATE}

{CREDITOR_NAME}
Attn: Credit Reporting Department

RE: Good Will Adjustment Request
Account Number: {ACCOUNT_NUMBER}

To Whom It May Concern:

I am writing to you today regarding my account referenced above. I have been a loyal customer since 2019 and have enjoyed my relationship with your company.

I am writing to request a "goodwill adjustment" to remove the late payment listing(s) from my credit report. At the time of the late payment, I was experiencing a temporary financial hardship due to a family emergency. Since then, I have maintained a perfect payment history.

Strategic Note: {VERDICT}

I am planning to apply for a business mortgage soon, and this single negative mark is impacting my score disproportionately. Given my long history with your company and my current good standing, I am asking for a courtesy removal of this late payment record.

Thank you for your consideration.

Sincerely,

John Hustler`
    }
  ];

  // Simulate local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('financeMonkeyData');
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  const handleGenerateLetter = (templateContent: string) => {
    const email = window.prompt("Enter your contact email to include in the letter:", userEmail);
    if (email === null) return; 
    
    setUserEmail(email);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let filled = templateContent.replace('{DATE}', today);
    filled = filled.replace('{EMAIL}', email || '[YOUR EMAIL]');
    filled = filled.replace('{REASON}', 'Accuracy of records');
    filled = filled.replace('{VERDICT}', 'Standard verification request based on consumer reporting accuracy.');
    
    filled = filled.replace('{ACCOUNT_NAME}', '[ACCOUNT NAME]');
    filled = filled.replace('{CREDITOR_NAME}', '[CREDITOR NAME]');
    filled = filled.replace('{PROVIDER_NAME}', '[PROVIDER NAME]');
    filled = filled.replace('{ACCOUNT_NUMBER}', '[ACCOUNT NUMBER]');

    setCurrentLetter(filled);
    setLetterView(true);
    setCopied(false);
    setDisputeWizardOpen(false);
  };

  const handleNextToVerdict = async () => {
    setIsAnalyzing(true);
    setDisputeStep(3);
    const verdict = await analyzeDispute(
      newDisputeData.type, 
      newDisputeData.creditor, 
      newDisputeData.reason
    );
    setAiVerdict(verdict);
    setIsAnalyzing(false);
  };

  const handleWizardComplete = () => {
    const template = LETTER_TEMPLATES.find(t => t.id === newDisputeData.type);
    if (!template) return;

    let content = template.content;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    content = content.replace('{DATE}', today);
    content = content.replace('{EMAIL}', userEmail || '[YOUR EMAIL]');
    content = content.replace('{REASON}', newDisputeData.reason);
    content = content.replace('{ACCOUNT_NUMBER}', newDisputeData.accountNumber || '[ACCOUNT NUMBER]');
    content = content.replace('{VERDICT}', aiVerdict || 'Requesting immediate physical verification per FCRA guidelines.');
    
    if (newDisputeData.type === 'hipaa') {
        content = content.replace('{PROVIDER_NAME}', newDisputeData.creditor || '[PROVIDER NAME]');
    } else if (newDisputeData.type === 'goodwill') {
        content = content.replace('{CREDITOR_NAME}', newDisputeData.creditor || '[CREDITOR NAME]');
    } else {
        content = content.replace('{ACCOUNT_NAME}', newDisputeData.creditor || '[ACCOUNT NAME]');
    }

    setCurrentLetter(content);
    setLetterView(true);
    setDisputeWizardOpen(false);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startWizard = () => {
    setDisputeWizardOpen(true);
    setDisputeStep(1);
    setNewDisputeData({
        type: '609',
        creditor: '',
        accountNumber: '',
        reason: 'Not mine',
    });
    setAiVerdict('');
    setLetterView(false);
  };

  const NavItem = ({ section, icon: Icon, label }: { section: Section; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveSection(section);
        setMobileMenuOpen(false);
        setLetterView(false);
        setDisputeWizardOpen(false);
      }}
      className={`w-full text-left py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center space-x-3 group ${
        activeSection === section 
          ? 'bg-monkey text-white shadow-lg shadow-monkey/30' 
          : 'text-gray-400 hover:bg-monkey/10 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${activeSection === section ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard data={userData} onExport={() => alert('Exporting credit report...')} />;
      case 'ai-chat':
        return <AiChat />;
      case 'taxes':
        return (
          <div className="animate-fade-in">
             <h2 className="text-3xl font-black text-white font-mono uppercase mb-8">Tax Optimization</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-dark-700 p-8 rounded-2xl border border-monkey/20">
                  <h3 className="text-xl font-bold text-monkey mb-6">Tax Savings Found</h3>
                  <div className="space-y-4">
                    {['S-Corp Election (+$9,412)', 'Home Office Deduction (+$2,847)', 'Vehicle Mileage (+$4,328)'].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-monkey/10 rounded-xl border border-monkey/20">
                        <span className="font-semibold text-gray-200">{item.split('(')[0]}</span>
                        <span className="font-bold text-green-400 font-mono">{item.split('(')[1].replace(')', '')}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 bg-gradient-to-r from-monkey to-monkey-dark text-white font-black py-4 rounded-xl hover:opacity-90 transition shadow-lg shadow-monkey/25">
                    FILE TAXES NOW
                  </button>
                </div>
                
                <div className="bg-dark-700 p-8 rounded-2xl border border-monkey/20">
                  <h3 className="text-xl font-bold text-monkey mb-6">Upload Documents</h3>
                  <div className="border-2 border-dashed border-monkey/30 rounded-xl p-12 text-center bg-monkey/5 hover:bg-monkey/10 transition cursor-pointer">
                    <CloudUpload className="mx-auto text-monkey mb-4 w-12 h-12" />
                    <p className="text-gray-300 font-medium">Drag & drop W-2s, 1099s, or receipts</p>
                  </div>
                </div>
             </div>
          </div>
        );
      case 'disputes':
        return (
           <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white font-mono uppercase">Disputes Machine</h2>
                {disputeWizardOpen && (
                    <button 
                        onClick={() => setDisputeWizardOpen(false)} 
                        className="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                        <X size={20} /> Cancel
                    </button>
                )}
            </div>

            {disputeWizardOpen ? (
                <div className="max-w-2xl mx-auto bg-dark-700 rounded-3xl p-8 border border-monkey/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-monkey/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            {[1, 2, 3].map((step) => (
                              <React.Fragment key={step}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-300 ${
                                  disputeStep === step ? 'bg-monkey text-white scale-110 shadow-lg shadow-monkey/40 ring-4 ring-monkey/20' : 
                                  disputeStep > step ? 'bg-green-500 text-white' : 'bg-dark-800 text-gray-500'
                                }`}>
                                  {disputeStep > step ? <Check size={20} /> : step}
                                </div>
                                {step < 3 && (
                                  <div className={`h-1 w-8 sm:w-16 transition-colors duration-500 ${disputeStep > step ? 'bg-green-500' : 'bg-dark-800'}`}></div>
                                )}
                              </React.Fragment>
                            ))}
                        </div>
                        <div className="text-gray-400 font-mono text-sm hidden sm:block">Flow: Savage Intel v3.5</div>
                    </div>

                    {disputeStep === 1 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                              <Target className="text-monkey" />
                              <h3 className="text-2xl font-black text-white">CHOOSE YOUR TARGET</h3>
                            </div>
                            <div className="grid gap-4">
                                {LETTER_TEMPLATES.map(template => (
                                    <button 
                                        key={template.id}
                                        onClick={() => {
                                            setNewDisputeData({...newDisputeData, type: template.id});
                                            setDisputeStep(2);
                                        }}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-5 group relative overflow-hidden ${
                                            newDisputeData.type === template.id 
                                            ? 'bg-monkey/10 border-monkey' 
                                            : 'bg-dark-800 border-transparent hover:border-monkey/50'
                                        }`}
                                    >
                                        <div className={`p-4 rounded-xl transition-colors ${newDisputeData.type === template.id ? 'bg-monkey text-white' : 'bg-dark-900 text-monkey'}`}>
                                            <template.icon size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-white text-xl uppercase tracking-tight">{template.title.replace(' Letter', '')}</p>
                                            <p className="text-gray-400 text-sm mt-1">{template.desc}</p>
                                        </div>
                                        <ChevronRight className={`text-monkey transition-transform duration-300 ${newDisputeData.type === template.id ? 'translate-x-2' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {disputeStep === 2 && (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                              <Mail className="text-monkey" />
                              <h3 className="text-2xl font-black text-white uppercase">GATHERING INTEL</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2 transition-colors group-focus-within:text-monkey">Contact Email</label>
                                    <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-monkey transition-colors" />
                                      <input 
                                          type="email" 
                                          value={userEmail}
                                          onChange={(e) => setUserEmail(e.target.value)}
                                          placeholder="Ex: hustle@monkey.ai"
                                          className="w-full bg-dark-900 border-2 border-monkey/20 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-monkey outline-none transition-all shadow-inner"
                                      />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <div className="group">
                                      <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2 group-focus-within:text-monkey">Creditor Name</label>
                                      <input 
                                          type="text" 
                                          value={newDisputeData.creditor}
                                          onChange={(e) => setNewDisputeData({...newDisputeData, creditor: e.target.value})}
                                          placeholder={newDisputeData.type === 'hipaa' ? "Ex: Mercy Hospital" : "Ex: Capital One"}
                                          className="w-full bg-dark-900 border-2 border-monkey/20 rounded-2xl px-5 py-4 text-white focus:border-monkey outline-none transition-all shadow-inner"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2 group-focus-within:text-monkey">Account # (or Partial)</label>
                                      <input 
                                          type="text" 
                                          value={newDisputeData.accountNumber}
                                          onChange={(e) => setNewDisputeData({...newDisputeData, accountNumber: e.target.value})}
                                          placeholder="Ex: XXXX-8821"
                                          className="w-full bg-dark-900 border-2 border-monkey/20 rounded-2xl px-5 py-4 text-white focus:border-monkey outline-none transition-all shadow-inner"
                                      />
                                  </div>
                                </div>
                                <div className="group">
                                    <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2 group-focus-within:text-monkey">Dispute Reason</label>
                                    <select 
                                        value={newDisputeData.reason}
                                        onChange={(e) => setNewDisputeData({...newDisputeData, reason: e.target.value})}
                                        className="w-full bg-dark-900 border-2 border-monkey/20 rounded-2xl px-5 py-4 text-white focus:border-monkey outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                    >
                                        {DISPUTE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-10">
                                <button 
                                    onClick={() => setDisputeStep(1)}
                                    className="flex-1 bg-dark-800 text-white font-black py-4 rounded-2xl hover:bg-dark-900 transition flex items-center justify-center gap-2 border border-white/5"
                                >
                                    <ChevronLeft size={20} /> BACK
                                </button>
                                <button 
                                    onClick={handleNextToVerdict}
                                    disabled={!newDisputeData.creditor || !userEmail}
                                    className="flex-[2] bg-gradient-to-r from-monkey to-monkey-dark text-white font-black py-4 rounded-2xl hover:opacity-90 transition shadow-xl shadow-monkey/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    AI VERDICT <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {disputeStep === 3 && (
                      <div className="animate-fade-in text-center">
                        <div className="flex justify-center mb-6">
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isAnalyzing ? 'animate-spin border-4 border-monkey border-t-transparent' : 'bg-monkey/10'}`}>
                            {isAnalyzing ? <Bot size={48} className="text-monkey animate-pulse" /> : <Bot size={48} className="text-monkey" />}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <h3 className="text-3xl font-black text-white uppercase">MONKEY VERDICT</h3>
                           {!isAnalyzing && <div className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-1 rounded border border-green-500/30 flex items-center gap-1 animate-pulse"><Sparkles size={10}/> AI_READY</div>}
                        </div>
                        <p className="text-gray-400 mb-8 font-mono italic">
                          {isAnalyzing ? "Processing bureaucracy weakness..." : "\"Target acquired. Locked and loaded.\""}
                        </p>
                        
                        <div className="bg-dark-800 rounded-3xl p-8 border border-monkey/20 text-left mb-8 relative overflow-hidden transition-all duration-500">
                          <div className="absolute top-0 left-0 w-1 h-full bg-monkey"></div>
                          
                          {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-12 h-12 text-monkey animate-spin" />
                                <p className="text-gray-400 font-mono text-sm">Analyzing {newDisputeData.creditor}'s legal vulnerability...</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-6">
                                 <div>
                                   <p className="text-xs text-gray-400 uppercase font-black tracking-widest">Deletion Probability</p>
                                   <p className="text-4xl font-black text-green-400 font-mono">
                                     {LETTER_TEMPLATES.find(t => t.id === newDisputeData.type)?.probability}%
                                   </p>
                                 </div>
                                 <ShieldAlert className="text-monkey w-12 h-12 opacity-30" />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-monkey/10 rounded-xl border border-monkey/30 relative">
                                  <div className="absolute -top-2 -right-2 bg-monkey text-white text-[8px] font-black px-1 rounded">STRATEGIC_HIT</div>
                                  <p className="text-monkey font-black text-xs uppercase mb-1 flex items-center gap-1">
                                    <Zap size={14} /> AI Savage Strategy
                                  </p>
                                  <p className="text-gray-100 text-sm leading-relaxed font-bold italic">
                                    "{aiVerdict}"
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-dark-900 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Target</p>
                                    <p className="text-white font-bold truncate">{newDisputeData.creditor}</p>
                                  </div>
                                  <div className="p-3 bg-dark-900 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Reason</p>
                                    <p className="text-white font-bold truncate">{newDisputeData.reason}</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          <button 
                              onClick={handleWizardComplete}
                              disabled={isAnalyzing}
                              className="w-full bg-gradient-to-r from-monkey via-monkey-dark to-monkey text-white font-black py-5 rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-monkey/40 flex items-center justify-center gap-3 disabled:opacity-50 group hover:scale-[1.01] active:scale-[0.98]"
                          >
                              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                <Zap size={20} className="fill-white" />
                              </div>
                              <span className="text-xl uppercase tracking-tight">EXECUTE SAVAGE LETTER</span>
                          </button>
                          
                          <button 
                              onClick={() => setDisputeStep(2)}
                              className="w-full bg-dark-800 text-gray-400 font-black py-3 rounded-xl hover:bg-dark-900 hover:text-white transition flex items-center justify-center gap-2 border border-white/5"
                          >
                              <ChevronLeft size={16} /> ADJUST INTEL
                          </button>
                        </div>
                      </div>
                    )}
                </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-dark-700 p-8 rounded-3xl border border-monkey/20 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-monkey flex items-center gap-2">
                    <ShieldAlert size={20} /> ACTIVE HITS
                  </h3>
                  <span className="text-xs font-mono text-gray-500">Total: {userData.activeDisputes}</span>
                </div>
                <div className="space-y-4">
                   <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
                      <div className="flex justify-between items-start">
                         <div>
                           <span className="font-black text-white text-lg group-hover:text-red-400 transition-colors uppercase tracking-tight">Capital One Collection</span>
                           <p className="text-gray-400 text-xs mt-1 font-mono uppercase">ID: XXXX-4412 • $1,247</p>
                         </div>
                         <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] border border-red-500/30 uppercase font-black tracking-widest">Medical</span>
                      </div>
                      <div className="mt-5">
                        <div className="flex justify-between text-[10px] mb-2">
                          <span className="text-gray-400 font-bold uppercase tracking-widest">Deletion Intel</span>
                          <span className="text-green-400 font-black">92% SUCCESS</span>
                        </div>
                        <div className="w-full bg-dark-900 rounded-full h-3 overflow-hidden p-[2px]">
                           <div className="bg-gradient-to-r from-red-600 to-green-500 h-full rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <Clock size={12} /> LAST CHECK: 2 HOURS AGO
                      </div>
                   </div>
                </div>
                <button 
                    onClick={startWizard}
                    className="w-full mt-8 bg-gradient-to-r from-monkey to-monkey-dark text-white font-black py-4 rounded-2xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-monkey/25"
                >
                  <Gavel size={22} className="animate-pulse" />
                  START NEW DISPUTE
                </button>
              </div>

               <div className="bg-dark-700 p-8 rounded-3xl border border-monkey/20 flex flex-col min-h-[550px] shadow-xl">
                  {letterView ? (
                    <div className="animate-fade-in flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setLetterView(false)} className="text-gray-400 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors group">
                                <div className="bg-dark-800 p-1 rounded group-hover:bg-monkey/20"><ArrowLeft size={16}/></div> BACK TO INTEL
                            </button>
                            <span className="text-monkey font-mono text-xs uppercase border border-monkey/30 px-3 py-1 rounded-full bg-monkey/5 font-black tracking-widest animate-pulse">Letter Ready</span>
                        </div>
                        <div className="flex-1 relative mb-6">
                          <textarea 
                              className="w-full h-full bg-dark-900 border-2 border-monkey/20 focus:border-monkey/50 rounded-2xl p-6 text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none shadow-inner scrollbar-thin scrollbar-thumb-monkey/20"
                              value={currentLetter}
                              onChange={(e) => setCurrentLetter(e.target.value)}
                              spellCheck={false}
                          />
                          <div className="absolute top-4 right-4 text-[10px] text-gray-700 font-mono select-none">SAVAGE_INTEL_v3.5</div>
                        </div>
                        <div className="flex gap-4">
                             <button 
                                onClick={copyToClipboard} 
                                className={`flex-1 flex items-center justify-center gap-2 font-black py-4 rounded-2xl transition-all duration-300 ${copied ? 'bg-green-500 text-white scale-105' : 'bg-dark-800 hover:bg-dark-600 text-white border border-monkey/30 hover:border-monkey/60'}`}
                             >
                                {copied ? <><Check size={20}/> COPIED TO CLIPBOARD</> : <><Copy size={20}/> COPY TO CLIPBOARD</>}
                             </button>
                             <button className="flex-1 bg-monkey hover:bg-monkey-dark text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-monkey/20 flex items-center justify-center gap-2 hover:scale-[1.02]">
                                <Printer size={20}/> PRINT & MAIL PDF
                             </button>
                        </div>
                    </div>
                  ) : (
                    <>
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xl font-bold text-monkey flex items-center gap-2">
                            <FileText size={20} /> QUICK TEMPLATES
                          </h3>
                          <Bot size={20} className="text-monkey/40" />
                        </div>
                        <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-monkey/10">
                            {LETTER_TEMPLATES.map((t, i) => (
                            <div 
                                key={i} 
                                onClick={() => handleGenerateLetter(t.content)}
                                className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-300 group-hover:text-white group-hover:bg-monkey/80 transition-all duration-300 shadow-sm">
                                        <t.icon size={22} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white group-hover:text-monkey transition-colors uppercase tracking-tight text-lg">{t.title}</p>
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{t.desc}</p>
                                    </div>
                                </div>
                                <div className="bg-dark-800 p-2 rounded-lg opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border border-white/5">
                                  <ArrowUpRight className="text-monkey" size={18} />
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-8">
                          <div className="p-5 bg-monkey/5 rounded-2xl border border-monkey/10 flex items-start gap-3">
                              <Bot size={20} className="text-monkey shrink-0 mt-1 animate-bounce" /> 
                              <div>
                                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                                  <span className="text-monkey font-black uppercase">Monkey Pro Tip:</span> 609 letters legally force bureaus to prove validity via original ink signatures, not just digital records.
                                </p>
                              </div>
                          </div>
                        </div>
                    </>
                  )}
               </div>
            </div>
            )}
           </div>
        );
      case 'personal-credit':
      case 'business-credit':
        return (
          <div className="flex flex-col items-center justify-center h-[500px] text-center animate-fade-in">
             <div className="bg-monkey/10 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-monkey rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <CreditCard className="w-16 h-16 text-monkey relative z-10" />
             </div>
             <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">Access Restricted</h2>
             <p className="text-gray-400 max-w-md font-mono text-sm">Monkey is currently brute-forcing the bureau servers to unlock this section. Check back in 24h or upgrade to Pro for early intel.</p>
             <button onClick={() => setActiveSection('dashboard')} className="mt-8 bg-dark-800 text-white font-black px-10 py-3 rounded-xl border border-monkey/20 hover:bg-monkey hover:text-white transition-all shadow-lg hover:shadow-monkey/20">Return to Dashboard</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1629]">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-monkey to-monkey-dark text-white shadow-xl z-50">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-pulse-slow">🐒</span>
          <span className="font-black font-mono text-xl tracking-tighter">FINANCE MONKEY</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white/10 rounded-lg backdrop-blur-md"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed lg:static inset-0 z-40 bg-[#0a0e27] lg:bg-transparent lg:w-80 border-r border-monkey/20 
        transform transition-transform duration-500 ease-in-out p-6 flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area Desktop */}
        <div className="hidden lg:flex items-center gap-4 mb-10 px-2 group">
          <div className="text-5xl animate-pulse-slow group-hover:scale-110 transition-transform cursor-pointer">🐒</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-mono text-white leading-none">FINANCE<br/>MONKEY AI</h1>
            <p className="text-[10px] text-monkey font-black uppercase tracking-[0.2em] mt-1 opacity-80">Savage Hitman</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
          <NavItem section="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem section="taxes" icon={FileText} label="Tax Optimization" />
          <NavItem section="personal-credit" icon={User} label="Personal Credit" />
          <NavItem section="business-credit" icon={Building2} label="Business Funding" />
          <NavItem section="disputes" icon={Gavel} label="Dispute Machine" />
          <NavItem section="ai-chat" icon={Bot} label="Monkey Brain" />
        </div>

        {/* Upgrade Card */}
        <div className="mt-8 p-6 bg-gradient-to-br from-monkey to-monkey-dark text-white rounded-3xl text-center shadow-2xl shadow-monkey/20 relative overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-black opacity-10 rounded-full blur-xl"></div>
          <h4 className="font-black text-xl mb-1 relative z-10 uppercase tracking-tight">Monkey Pro</h4>
          <p className="text-[11px] font-bold opacity-80 mb-5 relative z-10 uppercase tracking-widest font-mono">Unlimited Disputes • AI Max</p>
          <button className="bg-white text-monkey px-6 py-3 rounded-2xl font-black w-full hover:bg-gray-100 transition-all relative z-10 shadow-xl hover:scale-[1.03] active:scale-95">
            UPGRADE $29/mo
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-dark-900/50 backdrop-blur-3xl">
         {/* Desktop Header Info */}
         <header className="hidden lg:flex justify-between items-center p-10 pb-4">
           <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Status: Active Hustle</p>
              <h2 className="text-3xl font-black text-white tracking-tight">Mornin', <span className="text-monkey underline decoration-monkey/30 decoration-4 underline-offset-8">John Hustler</span></h2>
           </div>
           <div className="text-right flex items-center gap-6 bg-dark-800/40 p-4 rounded-3xl border border-white/5">
             <div>
               <div className="text-4xl font-black font-mono text-white flex items-center gap-3 justify-end">
                  {userData.creditScore} 
                  <span className="text-green-400 text-xs font-black bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">↑87</span>
               </div>
               <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-1">Personal Score</p>
             </div>
             <div className="w-px h-10 bg-white/10"></div>
             <div>
               <div className="text-4xl font-black font-mono text-blue-400 flex items-center gap-3 justify-end">
                  {userData.businessPaydex}
               </div>
               <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-1">Paydex Score</p>
             </div>
           </div>
         </header>

         {/* Dynamic Section Content */}
         <div className="p-4 md:p-8 lg:p-10 pb-24 lg:pb-10 max-w-7xl mx-auto">
            {renderContent()}
         </div>
      </main>

      {/* Floating Chat Button (Mobile) */}
      <button 
        onClick={() => { setActiveSection('ai-chat'); setMobileMenuOpen(false); }}
        className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-monkey to-monkey-dark rounded-3xl shadow-2xl flex items-center justify-center text-3xl z-30 animate-pulse-slow hover:scale-110 transition-transform active:scale-90 border-2 border-white/20"
      >
        🐒
      </button>

    </div>
  );
}

export default App;

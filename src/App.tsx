import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  Phone, 
  Mail, 
  Activity, 
  Settings, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Trash2,
  Edit2,
  FileText,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinicStore, Client, AmputationLevel, FollowUp, ProstheticSpec } from './store';

// --- Components ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '', ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  type = 'button'
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  className?: string,
  disabled?: boolean,
  type?: 'button' | 'submit'
}) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100',
  };
  
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>}
    <input 
      {...props}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
    />
  </div>
);

const Select = ({ label, options, ...props }: { label?: string, options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>}
    <select 
      {...props}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-bottom border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  const { clients, addClient, deleteClient, addProsthetic, addFollowUp, updateFollowUp } = useClinicStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isAddProstheticOpen, setIsAddProstheticOpen] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const upcomingFollowUps = useMemo(() => {
    const all = clients.flatMap(c => c.followUps.map(f => ({ ...f, clientName: `${c.firstName} ${c.lastName}`, clientId: c.id })));
    return all
      .filter(f => f.status === 'Scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [clients]);

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addClient({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      amputationLevel: formData.get('amputationLevel') as AmputationLevel,
      amputationDate: formData.get('amputationDate') as string,
      notes: formData.get('notes') as string,
    });
    setIsAddClientOpen(false);
  };

  const handleAddFollowUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const formData = new FormData(e.currentTarget);
    addFollowUp(selectedClientId, {
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
      status: 'Scheduled',
    });
    setIsAddFollowUpOpen(false);
  };

  const handleAddProsthetic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const formData = new FormData(e.currentTarget);
    addProsthetic(selectedClientId, {
      type: formData.get('type') as string,
      socketType: formData.get('socketType') as string,
      components: formData.get('components') as string,
      alignmentNotes: formData.get('alignmentNotes') as string,
      dateFitted: formData.get('dateFitted') as string,
    });
    setIsAddProstheticOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-white border-r border-slate-200 z-40 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">ProstheticCare</span>
        </div>
        
        <div className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedClientId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="hidden md:block font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => { setActiveTab('clients'); setSelectedClientId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Users className="w-5 h-5" />
            <span className="hidden md:block font-medium">Clients</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              const data = localStorage.getItem('prosthetic-clinic-storage');
              if (data) {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `prosthetic-clinic-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="hidden md:block text-sm font-medium">Export Data</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {selectedClientId ? 'Client Profile' : activeTab === 'dashboard' ? 'Clinic Dashboard' : 'Client Directory'}
              </h1>
              <p className="text-slate-500 mt-1">
                {selectedClientId ? 'Managing records and follow-ups' : activeTab === 'dashboard' ? 'Overview of upcoming activities' : 'Search and manage your clinic patients'}
              </p>
            </div>
            {!selectedClientId && (
              <Button onClick={() => setIsAddClientOpen(true)}>
                <Plus className="w-4 h-4" />
                New Client
              </Button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {selectedClientId && selectedClient ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <Button variant="ghost" onClick={() => setSelectedClientId(null)} className="-ml-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to list
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Client Info */}
                  <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 border-4 border-white shadow-sm">
                          <Users className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold">{selectedClient.firstName} {selectedClient.lastName}</h2>
                        <Badge variant="default">{selectedClient.amputationLevel}</Badge>
                        
                        <div className="w-full mt-6 space-y-4 text-left">
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {selectedClient.phone}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {selectedClient.email}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            DOB: {new Date(selectedClient.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100">
                          <Button variant="danger" className="w-full" onClick={() => { if(confirm('Delete client?')) { deleteClient(selectedClient.id); setSelectedClientId(null); } }}>
                            <Trash2 className="w-4 h-4" />
                            Delete Client
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Clinical Notes
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedClient.notes || 'No clinical notes recorded.'}
                      </p>
                    </Card>
                  </div>

                  {/* Right Column: Prosthetics & Follow-ups */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Prosthetics Section */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-slate-400" />
                          Prosthetic History
                        </h3>
                        <Button variant="outline" onClick={() => setIsAddProstheticOpen(true)}>
                          <Plus className="w-4 h-4" />
                          Add Device
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedClient.prosthetics.length === 0 ? (
                          <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                            No prosthetic devices recorded.
                          </div>
                        ) : (
                          selectedClient.prosthetics.map(p => (
                            <Card key={p.id} className="p-5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-slate-900">{p.type}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">Fitted on {new Date(p.dateFitted).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="success">Active</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Socket Type</span>
                                  <p className="text-sm text-slate-700">{p.socketType}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Components</span>
                                  <p className="text-sm text-slate-700">{p.components}</p>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alignment Notes</span>
                                <p className="text-sm text-slate-600 italic mt-1">{p.alignmentNotes}</p>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </section>

                    {/* Follow-ups Section */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          Follow-up Schedule
                        </h3>
                        <Button variant="outline" onClick={() => setIsAddFollowUpOpen(true)}>
                          <Plus className="w-4 h-4" />
                          Schedule
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedClient.followUps.length === 0 ? (
                          <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                            No follow-ups scheduled.
                          </div>
                        ) : (
                          selectedClient.followUps.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(f => (
                            <div key={f.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 group">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {f.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{new Date(f.date).toLocaleDateString()}</span>
                                  <Badge variant={f.status === 'Completed' ? 'success' : 'warning'}>{f.status}</Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{f.notes}</p>
                              </div>
                              {f.status === 'Scheduled' && (
                                <Button variant="ghost" onClick={() => updateFollowUp(selectedClient.id, f.id, { status: 'Completed' })} className="opacity-0 group-hover:opacity-100">
                                  Complete
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-slate-900 text-white border-none">
                    <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                    <h3 className="text-4xl font-bold mt-1">{clients.length}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      Active patients in database
                    </div>
                  </Card>
                  <Card className="p-6">
                    <p className="text-slate-500 text-sm font-medium">Upcoming Appointments</p>
                    <h3 className="text-4xl font-bold mt-1">{upcomingFollowUps.length}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
                      <Calendar className="w-3 h-3" />
                      Scheduled for next 30 days
                    </div>
                  </Card>
                  <Card className="p-6">
                    <p className="text-slate-500 text-sm font-medium">Recent Fittings</p>
                    <h3 className="text-4xl font-bold mt-1">
                      {clients.reduce((acc, c) => acc + c.prosthetics.length, 0)}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Activity className="w-3 h-3" />
                      Total devices delivered
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-400" />
                      Upcoming Follow-ups
                    </h3>
                    <div className="space-y-3">
                      {upcomingFollowUps.length === 0 ? (
                        <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                          No upcoming appointments.
                        </div>
                      ) : (
                        upcomingFollowUps.slice(0, 5).map(f => (
                          <div key={f.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer" onClick={() => setSelectedClientId(f.clientId)}>
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-900">
                              <span className="text-[10px] font-bold uppercase text-slate-400">{new Date(f.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-lg font-bold leading-none">{new Date(f.date).getDate()}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm">{f.clientName}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{f.notes}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      Recent Clients
                    </h3>
                    <div className="space-y-3">
                      {clients.length === 0 ? (
                        <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                          No clients added yet.
                        </div>
                      ) : (
                        clients.slice(-5).reverse().map(c => (
                          <div key={c.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer" onClick={() => setSelectedClientId(c.id)}>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm">{c.firstName} {c.lastName}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{c.amputationLevel}</p>
                            </div>
                            <Badge variant="default">New</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map(c => (
                    <Card key={c.id} className="hover:border-slate-400 transition-all cursor-pointer group" onClick={() => setSelectedClientId(c.id)}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <Users className="w-6 h-6" />
                          </div>
                          <Badge variant="default">{c.amputationLevel}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{c.firstName} {c.lastName}</h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />
                            {c.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Visit</span>
                          <span className="text-xs font-medium text-slate-600">
                            {c.followUps.length > 0 ? new Date(c.followUps[0].date).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {filteredClients.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No clients found</h3>
                    <p className="text-slate-500">Try adjusting your search query</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} title="Add New Client">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required placeholder="John" />
            <Input label="Last Name" name="lastName" required placeholder="Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" name="email" type="email" required placeholder="john@example.com" />
            <Input label="Phone" name="phone" required placeholder="+1 (555) 000-0000" />
          </div>
          <Input label="Date of Birth" name="dateOfBirth" type="date" required />
          <Select 
            label="Amputation Level" 
            name="amputationLevel" 
            options={['Transtibial', 'Transfemoral', 'Partial Foot', 'Hip Disarticulation', 'Transradial', 'Transhumeral', 'Other']} 
          />
          <Input label="Amputation Date (Optional)" name="amputationDate" type="date" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Clinical Notes</label>
            <textarea 
              name="notes"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
              placeholder="Initial assessment notes..."
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Create Client</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddFollowUpOpen} onClose={() => setIsAddFollowUpOpen(false)} title="Schedule Follow-up">
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <Input label="Appointment Date" name="date" type="date" required />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose / Notes</label>
            <textarea 
              name="notes"
              rows={3}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
              placeholder="e.g. Socket adjustment, gait analysis..."
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddFollowUpOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Schedule</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddProstheticOpen} onClose={() => setIsAddProstheticOpen(false)} title="Add Prosthetic Device">
        <form onSubmit={handleAddProsthetic} className="space-y-4">
          <Input label="Device Type" name="type" required placeholder="e.g. Definitive Transtibial Prosthesis" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Socket Type" name="socketType" required placeholder="e.g. Suction, Pin" />
            <Input label="Date Fitted" name="dateFitted" type="date" required />
          </div>
          <Input label="Components" name="components" required placeholder="e.g. Ossur Vari-Flex, WillowWood Liner" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alignment Notes</label>
            <textarea 
              name="alignmentNotes"
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
              placeholder="Initial alignment settings..."
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddProstheticOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Save Device</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

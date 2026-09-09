import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  RotateCcw,
  Tag,
  Save,
  X,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FaqItem } from '../../types';
import { getApiUrl } from '../../config/api';
import { useApp } from '../../context/AppContext';
import { useCrmTheme } from '../context/CrmThemeContext';

export const CrmFaqView: React.FC = () => {
  const { showToast } = useApp();
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/faqs'));
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data?.faqs)) {
          setFaqs(data.faqs);
        }
      }
    } catch (err) {
      console.error('Failed to load FAQs for CRM:', err);
      showToast('Error', 'Failed to load FAQs from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingFaq({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1,
      isActive: true,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq({ ...faq });
    setIsEditModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question?.trim() || !editingFaq?.answer?.trim()) {
      showToast('Validation Error', 'Question and Answer are required', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const isUpdating = Boolean(editingFaq.id);
      const url = isUpdating
        ? getApiUrl(`/api/admin/faqs/${editingFaq.id}`)
        : getApiUrl('/api/admin/faqs');
      const method = isUpdating ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaq),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        showToast('Success', data.message || 'FAQ saved successfully', 'success');
        setIsEditModalOpen(false);
        setEditingFaq(null);
        fetchFaqs();
      } else {
        showToast('Error', data?.error || 'Failed to save FAQ', 'error');
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Network error saving FAQ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ question?')) {
      return;
    }
    try {
      const res = await fetch(getApiUrl(`/api/admin/faqs/${id}`), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        showToast('Deleted', 'FAQ question removed', 'info');
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      } else {
        showToast('Error', data?.error || 'Failed to delete FAQ', 'error');
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to delete FAQ', 'error');
    }
  };

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      const updatedStatus = !faq.isActive;
      const res = await fetch(getApiUrl(`/api/admin/faqs/${faq.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === faq.id ? { ...f, isActive: updatedStatus } : f))
        );
        showToast('Updated', `FAQ is now ${updatedStatus ? 'Visible to Users' : 'Hidden'}`, 'info');
      }
    } catch (err: any) {
      showToast('Error', 'Failed to toggle FAQ visibility', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all FAQs back to system standard defaults?')) {
      return;
    }
    try {
      const res = await fetch(getApiUrl('/api/admin/faqs/reset'), {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        showToast('Reset Complete', 'FAQs restored to official defaults', 'success');
        fetchFaqs();
      }
    } catch (err: any) {
      showToast('Error', 'Failed to reset FAQs', 'error');
    }
  };

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General')))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div
        className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
              Support & FAQ Knowledge Base
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live customer support FAQs rendered instantly to investors in real time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchFaqs}
            disabled={isLoading}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Reset to Official Defaults"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs by question or answer..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center space-y-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <FileQuestion className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No FAQs Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No questions matched your search criteria. Click &quot;Add New FAQ&quot; to create one or reset to standard defaults.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                        #{faq.order} {faq.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          faq.isActive
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}
                      >
                        {faq.isActive ? 'Active (Visible)' : 'Hidden (Draft)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {faq.question}
                    </h4>

                    {isExpanded ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2">
                        {faq.answer}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {faq.answer}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={isExpanded ? 'Collapse' : 'Expand preview'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(faq)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        faq.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                      title={faq.isActive ? 'Click to Hide from Users' : 'Click to Make Visible'}
                    >
                      {faq.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(faq)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Edit Question & Answer"
                    >
                      <Edit2 className="w-4 h-4 text-emerald-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-rose-950/50 hover:text-rose-400'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create FAQ Modal */}
      {isEditModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base font-display">
                  {editingFaq.id ? 'Edit FAQ Item' : 'Create New FAQ Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={editingFaq.category || 'General'}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Deposits & Withdrawals">Deposits & Withdrawals</option>
                  <option value="Investment Packages">Investment Packages</option>
                  <option value="Streaks & Rewards">Streaks & Rewards</option>
                  <option value="Account & Security">Account & Security</option>
                  <option value="Referrals & Earnings">Referrals & Earnings</option>
                  <option value="Support & Help">Support & Help</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="e.g. Can I withdraw deposited money directly?"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Answer (Full explanation for investors)
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Explain the policy or rule clearly so investors understand..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Display Order (Rank)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingFaq.order || 1}
                    onChange={(e) => setEditingFaq({ ...editingFaq, order: parseInt(e.target.value, 10) || 1 })}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Visibility
                  </label>
                  <div className="pt-1.5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="faq-is-active"
                      checked={editingFaq.isActive !== false}
                      onChange={(e) => setEditingFaq({ ...editingFaq, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="faq-is-active" className="text-xs font-bold cursor-pointer">
                      Published to Investors
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmFaqView;

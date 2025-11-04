
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TopNavigation from '../../components/base/TopNavigation';
import BottomNavigation from '../../components/base/BottomNavigation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useNotifications } from '../../hooks/useNotifications';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  reminder?: {
    date: Date;
    enabled: boolean;
  };
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

const NotesPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [notes, setNotes] = useLocalStorage<Note[]>('userNotes', []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { scheduleNotification, requestPermission } = useNotifications();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as Note['priority'],
    reminderDate: '',
    reminderTime: '',
    reminderEnabled: false
  });

  useEffect(() => {
    requestPermission();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      reminderDate: '',
      reminderTime: '',
      reminderEnabled: false
    });
    setShowAddForm(false);
    setShowReminderForm(false);
    setEditingNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const noteData: Note = {
      id: editingNote?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      createdAt: editingNote?.createdAt || new Date(),
      priority: formData.priority,
      completed: editingNote?.completed || false,
      reminder: formData.reminderEnabled && formData.reminderDate && formData.reminderTime ? {
        date: new Date(`${formData.reminderDate}T${formData.reminderTime}`),
        enabled: true
      } : undefined
    };

    if (editingNote) {
      setNotes(notes.map(note => note.id === editingNote.id ? noteData : note));
    } else {
      setNotes([...notes, noteData]);
    }

    // Schedule notification if reminder is set
    if (noteData.reminder && noteData.reminder.enabled) {
      scheduleNotification(
        noteData.title,
        noteData.content || 'تذكير بالمهمة',
        noteData.reminder.date
      );
    }

    resetForm();
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const toggleComplete = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      priority: note.priority,
      reminderDate: note.reminder ? note.reminder.date.toISOString().split('T')[0] : '',
      reminderTime: note.reminder ? note.reminder.date.toTimeString().slice(0, 5) : '',
      reminderEnabled: !!note.reminder?.enabled
    });
    if (note.reminder?.enabled) {
      setShowReminderForm(true);
    } else {
      setShowAddForm(true);
    }
  };

  const openSimpleNoteForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      reminderDate: '',
      reminderTime: '',
      reminderEnabled: false
    });
    setShowAddForm(true);
  };

  const openReminderNoteForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      reminderDate: '',
      reminderTime: '',
      reminderEnabled: true
    });
    setShowReminderForm(true);
  };

  const getPriorityColor = (priority: Note['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    }
  };

  const getSelectedPriorityColor = (priority: Note['priority'], selected: boolean) => {
    if (!selected) {
      return 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600';
    }
    switch (priority) {
      case 'high': return 'bg-red-500 text-white border-red-500 shadow-md';
      case 'medium': return 'bg-blue-500 text-white border-blue-500 shadow-md';
      case 'low': return 'bg-green-500 text-white border-green-5 shadow-md';
    }
  };

  const getPriorityLabel = (priority: Note['priority']) => {
    if (isRTL) {
      switch (priority) {
        case 'high': return 'عالية';
        case 'medium': return 'متوسطة';
        case 'low': return 'منخفضة';
      }
    } else {
      switch (priority) {
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
      }
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopNavigation 
        title={isRTL ? 'المذكرات الشخصية' : 'Personal Notes'}
      />
      
      <div className="pt-14 pb-20 px-4">
        {/* Add Note Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={openSimpleNoteForm}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-sticky-note-add-line text-teal-600 dark:text-teal-400 text-lg"></i>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {isRTL ? 'إضافة مذكرة' : 'Add Note'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {isRTL ? 'مذكرة بسيطة' : 'Simple note'}
            </div>
          </button>
          
          <button
            onClick={openReminderNoteForm}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-alarm-line text-orange-600 dark:text-orange-400 text-lg"></i>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {isRTL ? 'إضافة تنبيه' : 'Add Reminder'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {isRTL ? 'مذكرة مع تنبيه' : 'Note with reminder'}
            </div>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{notes.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي المذكرات' : 'Total Notes'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{notes.filter(n => n.completed).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'مكتملة' : 'Completed'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{notes.filter(n => !n.completed).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'معلقة' : 'Pending'}</div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {sortedNotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
              <i className="ri-sticky-note-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {isRTL ? 'لا توجد مذكرات بعد' : 'No notes yet'}
              </p>
              <div className="flex justify-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={openSimpleNoteForm}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  {isRTL ? 'إضافة مذكرة' : 'Add Note'}
                </button>
                <button
                  onClick={openReminderNoteForm}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  {isRTL ? 'إضافة تنبيه' : 'Add Reminder'}
                </button>
              </div>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div key={note.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ${note.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button
                      onClick={() => toggleComplete(note.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        note.completed 
                          ? 'bg-teal-600 border-teal-600 text-white' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-400'
                      }`}
                    >
                      {note.completed && <i className="ri-check-line text-xs"></i>}
                    </button>
                    <h3 className={`font-semibold text-gray-900 dark:text-white ${note.completed ? 'line-through' : ''}`}>
                      {note.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                      {getPriorityLabel(note.priority)}
                    </span>
                    <button
                      onClick={() => editNote(note)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
                
                {note.content && (
                  <p className={`text-gray-600 dark:text-gray-300 text-sm mb-3 ${note.completed ? 'line-through' : ''}`}>
                    {note.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(note.createdAt).toLocaleDateString(isRTL ? 'ar-AE' : 'en-US')}
                  </span>
                  {note.reminder && note.reminder.enabled && (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse text-orange-600 dark:text-orange-400">
                      <i className="ri-alarm-line"></i>
                      <span>
                        {new Date(note.reminder.date).toLocaleString(isRTL ? 'ar-AE' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Simple Note Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingNote ? (isRTL ? 'تعديل المذكرة' : 'Edit Note') : (isRTL ? 'إضافة مذكرة جديدة' : 'Add New Note')}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'العنوان' : 'Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل عنوان المذكرة' : 'Enter note title'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'المحتوى' : 'Content'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل تفاصيل المذكرة (حد أقصى 500 حرف)' : 'Enter note details (max 500 characters)'}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.content.length}/500 {isRTL ? 'حرف' : 'characters'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الأولوية' : 'Priority'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'low'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('low', formData.priority === 'low')}`}
                    >
                      {isRTL ? 'منخفضة' : 'Low'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'medium'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('medium', formData.priority === 'medium')}`}
                    >
                      {isRTL ? 'متوسطة' : 'Medium'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'high'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('high', formData.priority === 'high')}`}
                    >
                      {isRTL ? 'عالية' : 'High'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fixed Action Buttons */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title.trim()) return;

                    const noteData: Note = {
                      id: editingNote?.id || Date.now().toString(),
                      title: formData.title,
                      content: formData.content,
                      createdAt: editingNote?.createdAt || new Date(),
                      priority: formData.priority,
                      completed: editingNote?.completed || false
                    };

                    if (editingNote) {
                      setNotes(notes.map(note => note.id === editingNote.id ? noteData : note));
                    } else {
                      setNotes([...notes, noteData]);
                    }

                    resetForm();
                  }}
                  disabled={!formData.title.trim()}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-center shadow-lg border-2 border-teal-600 hover:border-teal-700"
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <i className="ri-add-line text-lg"></i>
                    <span>{editingNote ? (isRTL ? 'تحديث المذكرة' : 'Update Note') : (isRTL ? 'إضافة المذكرة' : 'Add Note')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Note Form Modal */}
      {showReminderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingNote ? (isRTL ? 'تعديل التنبيه' : 'Edit Reminder') : (isRTL ? 'إضافة تنبيه جديد' : 'Add New Reminder')}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'العنوان' : 'Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل عنوان التنبيه' : 'Enter reminder title'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'المحتوى' : 'Content'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-5 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل تفاصيل التنبيه (حد أقصى 500 حرف)' : 'Enter reminder details (max 500 characters)'}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.content.length}/500 {isRTL ? 'حرف' : 'characters'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الأولوية' : 'Priority'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'low'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('low', formData.priority === 'low')}`}
                    >
                      {isRTL ? 'منخفضة' : 'Low'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'medium'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('medium', formData.priority === 'medium')}`}
                    >
                      {isRTL ? 'متوسطة' : 'Medium'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, priority: 'high'})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${getSelectedPriorityColor('high', formData.priority === 'high')}`}
                    >
                      {isRTL ? 'عالية' : 'High'}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {isRTL ? 'وقت التنبيه' : 'Reminder Time'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'التاريخ' : 'Date'}
                      </label>
                      <input
                        type="date"
                        value={formData.reminderDate}
                        onChange={(e) => setFormData({...formData, reminderDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isRTL ? 'الوقت' : 'Time'}
                      </label>
                      <input
                        type="time"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData({...formData, reminderTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-orange-700 dark:text-orange-300">
                      <i className="ri-notification-line text-lg"></i>
                      <span className="text-sm font-medium">
                        {isRTL ? 'سيتم إرسال إشعار في الوقت المحدد' : 'A notification will be sent at the specified time'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fixed Action Buttons */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title.trim() || !formData.reminderDate || !formData.reminderTime) return;

                    const noteData: Note = {
                      id: editingNote?.id || Date.now().toString(),
                      title: formData.title,
                      content: formData.content,
                      createdAt: editingNote?.createdAt || new Date(),
                      priority: formData.priority,
                      completed: editingNote?.completed || false,
                      reminder: {
                        date: new Date(`${formData.reminderDate}T${formData.reminderTime}`),
                        enabled: true
                      }
                    };

                    if (editingNote) {
                      setNotes(notes.map(note => note.id === editingNote.id ? noteData : note));
                    } else {
                      setNotes([...notes, noteData]);
                    }

                    // Schedule notification
                    scheduleNotification(
                      noteData.title,
                      noteData.content || 'تذكير بالمهمة',
                      noteData.reminder!.date
                    );

                    resetForm();
                  }}
                  disabled={!formData.title.trim() || !formData.reminderDate || !formData.reminderTime}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-center shadow-lg border-2 border-orange-600 hover:border-orange-700"
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <i className="ri-alarm-line text-lg"></i>
                    <span>{editingNote ? (isRTL ? 'تحديث التنبيه' : 'Update Reminder') : (isRTL ? 'إضافة التنبيه' : 'Add Reminder')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default NotesPage;

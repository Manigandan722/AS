import { useState, useEffect } from 'react';
import { getMessages, markRead } from '../../services/api';
import toast from 'react-hot-toast';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    getMessages()
      .then(res => setMessages(res.data.messages))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setMessages(msgs => msgs.map(m => m._id === id ? { ...m, read: true } : m));
    } catch { toast.error('Failed'); }
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Messages</h1>
          <p className="text-dark-400 text-sm">Contact form submissions from the website</p>
        </div>
        {unread > 0 && (
          <span className="bg-gold-500/20 border border-gold-500/30 text-gold-400 text-sm px-3 py-1 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card text-center py-16 text-dark-400">
          <div className="text-4xl mb-3">✉️</div>
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg._id}
              className={`card transition-all duration-200 ${!msg.read ? 'border-gold-500/30 bg-gold-500/5' : 'border-dark-700'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-dark-900 font-bold text-sm flex-shrink-0">
                      {msg.name[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white font-semibold">{msg.name}</span>
                      <span className="text-dark-500 text-sm ml-2">{msg.mobile}</span>
                    </div>
                    {!msg.read && <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-dark-300 text-sm pl-11">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-dark-500 text-xs whitespace-nowrap">{fmtDate(msg.createdAt)}</span>
                  {!msg.read && (
                    <button onClick={() => handleMarkRead(msg._id)}
                      className="text-xs px-3 py-1 bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-300 hover:text-white transition-colors">
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Notifications Inbox</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#C62828] text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency invitations, clinical verification notices, and stock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck className="h-4 w-4" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 p-6">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all hover:border-slate-300 ${
                !item.is_read ? 'bg-red-50/20 border-red-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'match_invite'
                        ? 'bg-red-100 text-[#C62828]'
                        : item.type === 'stock_alert'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-[#C62828]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.link && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1"
                      onClick={() => {
                        markAsRead(item.id);
                        navigate(item.link!);
                      }}
                    >
                      View →
                    </Button>
                  )}
                  {!item.is_read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

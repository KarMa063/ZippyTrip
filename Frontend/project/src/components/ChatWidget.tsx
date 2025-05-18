import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { getCurrentUser } from '../lib/supabase';

interface Message {
  text: string;
  sender: 'user' | 'owner';
  timestamp: Date;
}

interface ChatWidgetProps {
  guestHouseId: string;
  ownerId: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ guestHouseId, ownerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userData = await getCurrentUser();
      if (userData?.user_id) {
        setUserId(userData.user_id);
        localStorage.setItem('userId', userData.user_id);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (isOpen && userId && ownerId) {
      fetchMessages();
    }
  }, [isOpen, userId, ownerId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${guestHouseId}/chat?travellerId=${userId}&ownerId=${ownerId}`
      );
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.messages.map((msg: any) => ({
          text: msg.message,
          sender: msg.sender_type === 'traveller' ? 'user' : 'owner',
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !ownerId) return;

    setIsLoading(true);
    const messageData = {
      traveller_id: userId,
      owner_id: ownerId,
      message: newMessage,
      sender_type: 'traveller' as const
    };

    console.log('Sending message with data:', messageData);

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${guestHouseId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            text: data.chatMessage.message,
            sender: data.chatMessage.sender_type === 'traveller' ? 'user' : 'owner',
            timestamp: new Date(data.chatMessage.created_at)
          }
        ]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat with Owner</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!userId || isLoading || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </button>       
            </div>     
            {!userId && (
              <p className="text-xs text-red-500 mt-1">
                Please log in to send messages
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};


export default ChatWidget;
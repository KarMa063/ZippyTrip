import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaArrowLeft, FaUser } from 'react-icons/fa';
import axios from 'axios';

interface Message {
  id: number;
  property_id: number;
  traveller_id: string;
  owner_id: string;
  message: string;
  sender_type: 'owner' | 'traveller';
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  property_id: number;
  traveller_id: string;
  traveller_email: string;
  property_name: string;
  messages: Message[];
  unreadCount: number;
}

function GMessages() {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [ownerId] = useState('1');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const messagesResponse = await axios.get('http://localhost:5000/api/messages');
      const messagesData = messagesResponse.data.messages;

      const groupedConversations: Record<string, Message[]> = {};
      messagesData.forEach((msg: Message) => {
        const key = `${msg.property_id}_${msg.traveller_id}`;
        groupedConversations[key] = groupedConversations[key] || [];
        groupedConversations[key].push(msg);
      });

      const enrichedConversations = await Promise.all(
        Object.entries(groupedConversations).map(async ([key, messages]) => {
          const firstMsg = messages[0];
          
          try {
            const [userResponse, propertyResponse] = await Promise.all([
              axios.get(`http://localhost:5000/api/users/${firstMsg.traveller_id}`),
              axios.get(`http://localhost:5000/api/gproperties/${firstMsg.property_id}`)
            ]);

            return {
              property_id: firstMsg.property_id,
              traveller_id: firstMsg.traveller_id,
              traveller_email: userResponse.data.user?.user_email || 'Unknown',
              property_name: propertyResponse.data.property?.name || 'Unknown Property',
              messages: messages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
              unreadCount: messages.filter(m => 
                !m.is_read && m.sender_type === 'traveller'
              ).length
            };
          } catch (error) {
            console.error(`Error enriching conversation ${key}:`, error);
            return {
              property_id: firstMsg.property_id,
              traveller_id: firstMsg.traveller_id,
              traveller_email: 'Not available',
              property_name: 'Not available',
              messages: messages,
              unreadCount: messages.filter(m => 
                !m.is_read && m.sender_type === 'traveller'
              ).length
            };
          }
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [ownerId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && selectedConversation) {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      container.scrollTop = container.scrollHeight;
      if (isNearBottom) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [selectedConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/${selectedConversation.property_id}/chat`,
        {
          traveller_id: selectedConversation.traveller_id,
          owner_id: ownerId,
          message: newMessage,
          sender_type: 'owner'
        }
      );

      if (response.data.success) {
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, response.data.chatMessage],
          unreadCount: 0
        };

        setConversations(prev =>
          prev.map(conv =>
            conv.traveller_id === selectedConversation.traveller_id &&
            conv.property_id === selectedConversation.property_id
              ? updatedConversation
              : conv
          )
        );
        setSelectedConversation(updatedConversation);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    if (conv.unreadCount > 0) {
      axios.get(
        `http://localhost:5000/api/messages/${conv.property_id}/chat?travellerId=${conv.traveller_id}&ownerId=${ownerId}&userType=owner`
      ).then(() => {
        setConversations(prev =>
          prev.map(c =>
            c.traveller_id === conv.traveller_id && c.property_id === conv.property_id
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      });
    }
    setSelectedConversation(conv);
  };

  const uniqueProperties = Array.from(
    new Set(conversations.map(conv => conv.property_name))
  ).filter(Boolean);

  const filteredConversations = conversations.filter(conv => {
    const tabFilter = activeTab === 'Unread' ? conv.unreadCount > 0 : true;
    const propertyFilterPass = 
      propertyFilter === 'all' || 
      conv.property_name?.toLowerCase() === propertyFilter.toLowerCase();
    return tabFilter && propertyFilterPass;
  });

  const isConversationView = !!selectedConversation;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      {!isConversationView && (
        <div className="flex flex-col gap-4 mb-4">
          <div className="w-full grid grid-cols-2 gap-2">
            {['All', 'Unread'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'All' | 'Unread')}
                className={`px-4 py-2 rounded font-semibold transition-colors border border-gray-750 rounded-lg ${
                  activeTab === tab ? 'bg-blue-500 text-white' : 'hover:bg-accent/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-750 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all" className="focus:bg-blue-500 focus:text-white">
                All Hotels
              </option>
              {uniqueProperties.map((property) => (
                <option key={property} value={property} className="focus:bg-blue-500 focus:text-white">
                  {property}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {isConversationView ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <button
              className="bg-transparent text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedConversation(null)}
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary">
                <FaUser className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-lg">{selectedConversation.traveller_email}</h2>
                <p className="text-sm text-gray-500">{selectedConversation.property_name}</p>
              </div>
            </div>
          </div>

          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 border border-gray-750 rounded-lg hide-scrollbar"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          >
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {selectedConversation.messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender_type === 'owner' ? 'justify-end' : 'justify-start'}`}
                  style={{ marginBottom: index < selectedConversation.messages.length - 1 ? '0.25rem' : '0' }}
                >
                  {message.sender_type !== 'owner' && (
                    <div className="h-8 w-8 rounded-full mr-2 bg-muted text-primary flex items-center justify-center">
                      <FaUser className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] sm:max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${message.sender_type === 'owner'
                      ? 'bg-blue-500 text-white'
                      : 'bg-secondary text-secondary-foreground'}`}
                    style={{ fontSize: '0.875rem' }} // Make font size smaller
                  >
                    <div className="text-sm">
                      {message.sender_type === 'owner' ? `You: ${message.message}` : message.message}
                    </div>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>


          <div className="border-t p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 rounded border border-gray-750 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-750 rounded-lg overflow-hidden">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={`${conversation.property_id}_${conversation.traveller_id}`}
                  className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-gray-750"
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary">
                      <FaUser className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{conversation.traveller_email}</p>
                      <p className="text-sm text-gray-500">{conversation.property_name}</p>
                      <p className={`text-sm ${conversation.unreadCount > 0 ? 'font-semibold' : 'text-gray-400'}`}>
                        {conversation.messages[conversation.messages.length - 1].sender_type === 'owner'
                          ? `You: ${conversation.messages[conversation.messages.length - 1].message}`
                          : conversation.messages[conversation.messages.length - 1].message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-400">
                      {new Date(conversation.messages[conversation.messages.length - 1].created_at)
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No {activeTab === 'Unread' ? 'unread' : ''} messages found
                {propertyFilter !== 'all' && ` for ${propertyFilter}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GMessages;
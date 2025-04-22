import { useState, useRef } from 'react';
import { FaPlus, FaSearch, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

interface Message {
  sender: string;
  text: string;
  time: string;
}

interface Conversation {
  initials: string;
  name: string;
  messages: Message[];
  status: 'unread' | 'read' | 'sent';
}

function GMessages() {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Sent by You'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversationsData: Conversation[] = [
    {
      initials: 'JD',
      name: 'John Doe',
      messages: [
        { sender: 'John Doe', text: 'Hi, I have a question about Himalayan Retreat.', time: '10:23 AM' },
      ],
      status: 'unread',
    },
    {
      initials: 'JS',
      name: 'Jane Smith',
      messages: [
        { sender: 'Jane Smith', text: 'Thanks for the information!', time: 'Yesterday' },
        { sender: 'You', text: 'You\'re welcome!', time: 'Yesterday' },
      ],
      status: 'read',
    },
    {
      initials: 'RB',
      name: 'Robert Brown',
      messages: [
        { sender: 'Robert Brown', text: 'I\'ll arrive around 3 PM.', time: '3 days ago' },
        { sender: 'You', text: 'Looking forward to it!', time: '3 days ago' },
      ],
      status: 'read',
    },
    {
      initials: 'SW',
      name: 'Sandra Williams',
      messages: [
        { sender: 'You', text: 'I\'ve sent over the booking confirmation.', time: '5 days ago' },
      ],
      status: 'sent',
    },
  ];

  const [conversations, setConversations] = useState<Conversation[]>(conversationsData);

  const filtered = conversations
    .filter((c) => {
      if (activeTab === 'Unread') return c.status === 'unread';
      if (activeTab === 'Sent by You') return c.messages.some((msg) => msg.sender === 'You');
      return true;
    })
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.messages.some((msg) => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMessageObj: Message = {
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedConversation: Conversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessageObj],
      status: 'sent',
    };

    const updatedConversations = conversations.map((conv) =>
      conv.name === selectedConversation.name ? updatedConversation : conv
    );

    setConversations(updatedConversations);
    setSelectedConversation(updatedConversation);
    setNewMessage('');

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isConversationView = !!selectedConversation;

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">Messages</h1>
        {!isConversationView && (
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaPlus className="h-3 w-3" />
            <span>New Message</span>
          </button>
        )}
      </div>

      {!isConversationView && (
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded border border-gray-750 bg-transparent text-white placeholder-gray-400"
          />
        </div>
      )}

      {!isConversationView && (
        <div className="w-full grid grid-cols-3 gap-2 mb-4">
          {['All', 'Unread', 'Sent by You'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'All' | 'Unread' | 'Sent by You')}
              className={`px-4 py-2 rounded font-semibold transition-colors border border-gray-750 rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-accent/50 transition-colors'
              }`}
            >
              {tab}
            </button>
          ))}
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
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary font-medium">
                {selectedConversation.initials}
              </div>
              <div>
                <h2 className="font-medium text-lg">{selectedConversation.name}</h2>
              </div>
            </div>
          </div>

          {/* Scrollable chat area only */}
          <div className="flex-1 overflow-y-auto p-4 border border-gray-750 rounded-lg hide-scrollbar">
            <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2">
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {selectedConversation.messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender !== 'You' && (
                      <div className="h-8 w-8 rounded-full mr-2 bg-muted text-primary flex items-center justify-center">
                        {selectedConversation.initials}
                      </div>
                    )}
                    <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-lg shadow-sm ${
                      message.sender === 'You'
                        ? 'bg-blue-500 text-white'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs opacity-70 text-right mt-1">{message.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 rounded border border-gray-750 bg-transparent text-white"
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
          {filtered.map((conversation) => (
            <div
              key={conversation.name}
              className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-gray-750"
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary font-medium">
                  {conversation.initials}
                </div>
                <div>
                  <p className="font-semibold">{conversation.name}</p>
                  <p className={`text-sm ${conversation.status === 'unread' ? 'font-semibold' : 'text-gray-400'}`}>
                    {conversation.messages[conversation.messages.length - 1].sender === 'You'
                      ? `You: ${conversation.messages[conversation.messages.length - 1].text}`
                      : conversation.messages[conversation.messages.length - 1].text}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {conversation.messages[conversation.messages.length - 1].time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GMessages;

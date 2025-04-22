import { useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

function GMessages() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    { initials: 'JD', name: 'John Doe', message: 'Hi, I have a question about the Ocean View Suite.', time: '10:23 AM', status: 'unread' },
    { initials: 'JS', name: 'Jane Smith', message: 'Thanks for the information!', time: 'Yesterday', status: 'read' },
    { initials: 'RB', name: 'Robert Brown', message: 'I\'ll arrive around 3 PM.', time: '3 days ago', status: 'read' },
    { initials: 'SW', name: 'Sandra Williams', message: 'You: I\'ve sent over the booking confirmation.', time: '5 days ago', status: 'sent' },
  ];

  const filtered = conversations
    .filter((c) => {
      if (activeTab === 'Unread') return c.status === 'unread';
      if (activeTab === 'Sent by You') return c.message.startsWith('You:');
      return true;
    })
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">Messages</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaPlus className="h-3 w-3" />
          <span>New Message</span>
        </button>
      </div>

      {/* Search */}
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

      {/* Tabs */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        {['All', 'Unread', 'Sent by You'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {/* Messages with outer border */}
      <div className="border border-gray-750 rounded-lg overflow-hidden">
        {filtered.map(({ initials, name, message, time, status }, index) => (
            <div
            key={name}
            className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-gray-750"
            >
            <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary font-medium">
                {initials}
                </div>
                <div>
                <p className="font-semibold">{name}</p>
                <p className={`text-sm ${status === 'unread' ? 'font-semibold' : 'text-gray-400'}`}>
                    {message}
                </p>
                </div>
            </div>
            <span className="text-sm text-gray-400">{time}</span>
            </div>
        ))}
        </div>
    </div>
  );
}

export default GMessages;

import { FaPlus, FaSearch } from 'react-icons/fa';

function GMessages() {
  const conversations = [
    { initials: 'JD', name: 'John Doe', message: 'Hi, I have a question about the Ocean View Suite.', time: '10:23 AM' },
    { initials: 'JS', name: 'Jane Smith', message: 'Thanks for the information!', time: 'Yesterday' },
    { initials: 'RB', name: 'Robert Brown', message: 'I\'ll arrive around 3 PM.', time: '3 days ago' },
    { initials: 'SW', name: 'Sandra Williams', message: 'You: I\'ve sent over the booking confirmation.', time: '5 days ago' },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Messages</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaPlus className="h-3 w-3" />
          <span> New Message</span>
        </button>
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full p-2 pl-10 rounded bg-gray-800 text-white placeholder-gray-400"
        />
      </div>

      <div className="flex gap-2 mb-4">
        {['All', 'Unread', 'Sent by You'].map((tab) => (
          <button key={tab} className="px-4 py-2 bg-gray-700 rounded text-white font-semibold">
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {conversations.map(({ initials, name, message, time }) => (
          <div key={name} className="flex items-start justify-between p-4 bg-gray-800 rounded">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                {initials}
              </div>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-gray-400 text-sm">{message}</p>
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

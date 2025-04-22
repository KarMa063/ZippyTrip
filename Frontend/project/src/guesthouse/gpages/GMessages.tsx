function GMessages() {
    return (
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            + New Message
          </button>
        </div>
  
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full px-4 py-2 mb-4 rounded bg-slate-800 text-white placeholder-slate-400"
        />
  
        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <button className="flex-1 bg-slate-700 py-2 rounded text-white font-semibold">All</button>
          <button className="flex-1 bg-slate-800 py-2 rounded text-slate-300">Unread</button>
          <button className="flex-1 bg-slate-800 py-2 rounded text-slate-300">Sent by You</button>
        </div>
  
        {/* Message List (Static) */}
        <div className="space-y-4">
          {["John Doe", "Jane Smith", "Robert Brown", "Sandra Williams"].map((name, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-slate-400 text-sm">Sample message text...</div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">Time</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default GMessages;
  
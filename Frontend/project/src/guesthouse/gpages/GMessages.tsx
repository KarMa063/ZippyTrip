
import { useState, useRef, useEffect } from "react";
import { Input } from "../gcomponents/input";
import { Button } from "../gcomponents/button";
import * as AvatarPrimitive from "@radix-ui/react-avatar"; 
import { Card } from "../gcomponents/card";
import * as ScrollArea from '@radix-ui/react-scroll-area'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaPaperPlane, FaArrowLeft } from "react-icons/fa";

// Mock conversation data
const initialConversations = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "",
      lastActive: "2 min ago",
      isOnline: true
    },
    lastMessage: {
      text: "Hi, I have a question about the Ocean View Suite.",
      time: "10:23 AM",
      isRead: true,
      sentByMe: false
    },
    messages: [
      { id: "m1", sender: "John Doe", text: "Hi, I have a question about the Ocean View Suite.", time: "10:23 AM", isOwner: false },
      { id: "m2", sender: "Owner", text: "Hello John! How can I help you?", time: "10:25 AM", isOwner: true },
      { id: "m3", sender: "John Doe", text: "Is the room air-conditioned?", time: "10:26 AM", isOwner: false },
      { id: "m4", sender: "Owner", text: "Yes, all our suites have air conditioning and heating.", time: "10:28 AM", isOwner: true },
    ]
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      avatar: "",
      lastActive: "1 hour ago",
      isOnline: false
    },
    lastMessage: {
      text: "Thanks for the information!",
      time: "Yesterday",
      isRead: false,
      sentByMe: false
    },
    messages: [
      { id: "m5", sender: "Jane Smith", text: "Hello, do you allow pets in your Mountain Cabin?", time: "Yesterday", isOwner: false },
      { id: "m6", sender: "Owner", text: "Hi Jane! Yes, we do allow pets in our Mountain Cabin.", time: "Yesterday", isOwner: true },
      { id: "m7", sender: "Jane Smith", text: "Great! Is there an additional fee?", time: "Yesterday", isOwner: false },
      { id: "m8", sender: "Owner", text: "There's a small cleaning fee of NRs. 1,500.", time: "Yesterday", isOwner: true },
      { id: "m9", sender: "Jane Smith", text: "Thanks for the information!", time: "Yesterday", isOwner: false },
    ]
  },
  {
    id: "3",
    user: {
      name: "Robert Brown",
      avatar: "",
      lastActive: "3 days ago",
      isOnline: false
    },
    lastMessage: {
      text: "I'll arrive around 3 PM.",
      time: "3 days ago",
      isRead: true,
      sentByMe: false
    },
    messages: [
      { id: "m10", sender: "Robert Brown", text: "Hi, what's the check-in time for the City Apartment?", time: "3 days ago", isOwner: false },
      { id: "m11", sender: "Owner", text: "Hello Robert! Check-in is at 2 PM, but let me know if you need an earlier time.", time: "3 days ago", isOwner: true },
      { id: "m12", sender: "Robert Brown", text: "That works fine. I'll arrive around 3 PM.", time: "3 days ago", isOwner: false },
      { id: "m13", sender: "Owner", text: "Perfect! We'll see you then.", time: "3 days ago", isOwner: true },
    ]
  },
  {
    id: "4",
    user: {
      name: "Sandra Williams",
      avatar: "",
      lastActive: "5 days ago",
      isOnline: false
    },
    lastMessage: {
      text: "I've sent over the booking confirmation.",
      time: "5 days ago",
      isRead: true,
      sentByMe: true
    },
    messages: [
      { id: "m14", sender: "Sandra Williams", text: "Hello, I'd like to book the Mountain View room for next weekend.", time: "5 days ago", isOwner: false },
      { id: "m15", sender: "Owner", text: "Hi Sandra! The Mountain View room is available. Would you prefer Friday to Sunday?", time: "5 days ago", isOwner: true },
      { id: "m16", sender: "Sandra Williams", text: "Yes, that would be perfect!", time: "5 days ago", isOwner: false },
      { id: "m17", sender: "Owner", text: "I've sent over the booking confirmation.", time: "5 days ago", isOwner: true },
    ]
  }
];

const GMessages = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<typeof initialConversations[0] | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("all");
  
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [selectedConversation]);
  
    const handleSendMessage = () => {
      if (!newMessage.trim() || !selectedConversation) return;
  
      const updatedMessage = {
        id: `m${Date.now()}`,
        sender: "Owner",
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwner: true
      };
  
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, updatedMessage],
            lastMessage: {
              text: newMessage,
              time: updatedMessage.time,
              isRead: true,
              sentByMe: true
            }
          };
          setSelectedConversation(updatedConv);
          return updatedConv;
        }
        return conv;
      });
  
      setConversations(updatedConversations);
      setNewMessage("");
  
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  
    const getInitials = (name: string) => {
      return name.split(" ").map(part => part[0]).join("");
    };
  
    const filteredConversations = conversations.filter(conversation => {
      const matchesSearch =
        conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase());
  
      if (!matchesSearch) return false;
  
      switch (activeTab) {
        case "unread":
          return !conversation.lastMessage.isRead;
        case "sent":
          return conversation.lastMessage.sentByMe;
        case "all":
        default:
          return true;
      }
    });
  
    const isConversationView = !!selectedConversation;
  
    return (
      <div className="h-[calc(100vh-130px)] flex flex-col">
        {!isConversationView ? (
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight text-white-500">Messages</h1>
              <Button onClick={() => {}} className="gap-1.5">
                <FaPlus className="h-4 w-4" />
                <span>New Message</span>
              </Button>
            </div>
  
            <div className="w-full mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
  
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="sent">Sent by You</TabsTrigger>
              </TabsList>
  
              <TabsContent value={activeTab} className="mt-0">
                <Card className="overflow-hidden">
                  {filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                      No conversations found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <AvatarPrimitive.Root className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary font-medium">
                            <AvatarPrimitive.Image src={conversation.user.avatar} alt={conversation.user.name} className="h-full w-full object-cover" />
                            <AvatarPrimitive.Fallback>{getInitials(conversation.user.name)}</AvatarPrimitive.Fallback>
                          </AvatarPrimitive.Root>
  
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-medium truncate">{conversation.user.name}</h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.lastMessage.time}</span>
                            </div>
                            <p className={`truncate ${conversation.lastMessage.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                              {conversation.lastMessage.sentByMe && "You: "}
                              {conversation.lastMessage.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="h-10 w-10">
                <FaArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <AvatarPrimitive.Root className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-muted text-primary font-medium">
                  <AvatarPrimitive.Image src={selectedConversation.user.avatar} alt={selectedConversation.user.name} className="h-full w-full object-cover" />
                  <AvatarPrimitive.Fallback>{getInitials(selectedConversation.user.name)}</AvatarPrimitive.Fallback>
                </AvatarPrimitive.Root>
                <div>
                  <h2 className="font-medium text-lg">{selectedConversation.user.name}</h2>
                </div>
              </div>
            </div>
  
            <Card className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea.Root className="flex-1 overflow-y-auto">
                <ScrollArea.Viewport className="h-full p-4">
                  <div className="space-y-6 max-w-3xl mx-auto pb-4">
                    {selectedConversation.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isOwner ? "justify-end" : "justify-start"}`}>
                        {!message.isOwner && (
                          <AvatarPrimitive.Root className="h-8 w-8 mr-2 mt-1">
                            <AvatarPrimitive.Fallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(selectedConversation.user.name)}
                            </AvatarPrimitive.Fallback>
                          </AvatarPrimitive.Root>
                        )}
                        <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-lg shadow-sm ${message.isOwner ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"}`}>
                          <div className="text-sm">{message.text}</div>
                          <div className="text-xs opacity-70 text-right mt-1">{message.time}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" />
                <ScrollArea.Scrollbar orientation="horizontal" />
                <ScrollArea.Corner />
              </ScrollArea.Root>
              <div className="border-t p-4">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button className="gap-1.5" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <FaPaperPlane className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };
  
  export default GMessages;
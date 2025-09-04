import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Archive,
  Trash2,
  Clock,
  CheckCheck
} from 'lucide-react';
import socketService from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';

const ChatSystem = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchChats();
    
    // Connect to socket if not already connected
    if (!socketService.isSocketConnected()) {
      socketService.connect();
    }

    return () => {
      if (activeChat) {
        socketService.leaveChat(activeChat._id);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      socketService.joinChat(activeChat._id);
      fetchMessages(activeChat._id);
    }

    return () => {
      if (activeChat) {
        socketService.leaveChat(activeChat._id);
      }
    };
  }, [activeChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.chat.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      content: newMessage,
      messageType: 'text'
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${activeChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        socketService.stopTyping(activeChat._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    
    if (!isTyping && activeChat) {
      setIsTyping(true);
      socketService.startTyping(activeChat._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeChat) {
        socketService.stopTyping(activeChat._id);
      }
    }, 1000);
  };

  const createDirectChat = async (participantId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChat(data.chat);
        fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const markAsRead = async (chatId) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const filteredChats = chats.filter(chat =>
    chat.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Messages
            </h2>
            <Button size="sm" variant="outline">
              New Chat
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => {
                  setActiveChat(chat);
                  if (chat.unreadCount > 0) {
                    markAsRead(chat._id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <img 
                      src={chat.displayPhoto || '/default-avatar.png'} 
                      alt={chat.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">
                        {chat.displayName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {chat.relatedJob && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {chat.relatedJob.title}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <img 
                      src={activeChat.displayPhoto || '/default-avatar.png'} 
                      alt={activeChat.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{activeChat.displayName}</h3>
                    <p className="text-sm text-gray-500">
                      {activeChat.otherParticipant?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-75">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.senderId === user._id && (
                          <CheckCheck className={`w-3 h-3 ${message.isRead ? 'text-blue-200' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-600 ml-2">typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
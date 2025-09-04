import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Monitor, 
  Settings,
  MessageSquare,
  Users,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import socketService from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';

const VideoInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [interview, setInterview] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchInterviewDetails();
    initializeInterview();
    
    return () => {
      cleanup();
    };
  }, [sessionId]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interview/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInterview(data.interview);
      } else {
        navigate('/interviews');
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      navigate('/interviews');
    }
  };

  const initializeInterview = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      
      // Join the interview
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interview/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionQuality: 'good' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Set up WebRTC if needed
        setupWebRTC(data.roomId, data.isHost);
      }
      
    } catch (error) {
      console.error('Error initializing interview:', error);
      setConnectionStatus('failed');
    }
  };

  const setupWebRTC = async (roomId, isHost) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers for production
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);
    
    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnectionRef.current.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendWebRTCIceCandidate(
          interview?.interviewer?._id === user._id ? 
            interview?.candidate?._id : interview?.interviewer?._id,
          event.candidate
        );
      }
    };

    // Set up socket event listeners for WebRTC signaling
    setupWebRTCListeners();
  };

  const setupWebRTCListeners = () => {
    // Listen for WebRTC events from socket service
    // These would be handled by the Redux store in a full implementation
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find(s => s.track && s.track.kind === 'video');
          
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find(s => s.track && s.track.kind === 'video');
        
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      setLocalStream(cameraStream);
      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const endInterview = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/interview/${sessionId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      cleanup();
      navigate('/interviews');
    } catch (error) {
      console.error('Error ending interview:', error);
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      // In a real implementation, this would go through the chat system
      const message = {
        id: Date.now(),
        content: newMessage,
        sender: user.fullName,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  const isInterviewer = interview.interviewer._id === user._id;
  const otherParticipant = isInterviewer ? interview.candidate : interview.interviewer;

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Interview Session</h1>
          </div>
          
          <Badge className={`${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}>
            {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            <Clock className="w-4 h-4 inline mr-1" />
            {formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true })}
          </div>
          
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          <div className="w-full h-full bg-gray-800 relative">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <img 
                      src={otherParticipant.profile?.profilePhoto || '/default-avatar.png'} 
                      alt={otherParticipant.fullName}
                      className="w-32 h-32 rounded-full"
                    />
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">{otherParticipant.fullName}</h3>
                  <p className="text-gray-400">Waiting for {otherParticipant.fullName} to join...</p>
                </div>
              </div>
            )}
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
              {localStream && !isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <Avatar className="w-16 h-16">
                    <img 
                      src={user.profile?.profilePhoto || '/default-avatar.png'} 
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full"
                    />
                  </Avatar>
                </div>
              )}
              
              {isScreenSharing && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-500 text-white text-xs">
                    <Monitor className="w-3 h-3 mr-1" />
                    Sharing
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "outline"}
                size="sm"
                className="rounded-full w-12 h-12"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={shareScreen}
                variant={isScreenSharing ? "secondary" : "outline"}
                size="sm"
                className="rounded-full w-12 h-12"
              >
                <Monitor className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={endInterview}
                variant="destructive"
                size="sm"
                className="rounded-full w-12 h-12"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={sendChatMessage}
                  size="sm"
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Info Bar */}
      <div className="bg-gray-800 text-white p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Job: {interview.job.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Duration: {interview.duration} minutes</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInterview;
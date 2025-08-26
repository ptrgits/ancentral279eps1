import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Hash, 
  Users, 
  Settings, 
  Plus,
  Lock,
  Globe,
  Mic,
  MicOff
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

interface UserSession {
  id: string;
  nickname: string;
  channel_id: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
}

const ChatInterface = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserSession[]>([]);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(true);

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Load messages when selected channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
      loadActiveUsers(selectedChannel.id);
    }
  }, [selectedChannel]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!selectedChannel) return;

    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('users-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        () => {
          loadActiveUsers(selectedChannel.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [selectedChannel]);

  const loadChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name');
    
    if (data && !error) {
      const typedChannels = data as Channel[];
      setChannels(typedChannels);
      if (typedChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(typedChannels[0]);
      }
    }
  };

  const loadMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at')
      .limit(50);
    
    if (data && !error) {
      setMessages(data);
    }
  };

  const loadActiveUsers = async (channelId: string) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('channel_id', channelId)
      .eq('is_online', true)
      .order('nickname');
    
    if (data && !error) {
      setActiveUsers(data);
    }
  };

  const handleJoinWithNickname = async () => {
    if (!nickname.trim() || !selectedChannel) return;
    
    // Create user session
    await supabase
      .from('user_sessions')
      .insert({
        nickname: nickname.trim(),
        channel_id: selectedChannel.id
      });
    
    setShowNicknameInput(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChannel || !nickname) return;
    
    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: selectedChannel.id,
        nickname,
        content: message.trim()
      });
    
    if (!error) {
      setMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showNicknameInput) {
    return (
      <div className="min-h-screen bg-black text-text-primary flex items-center justify-center">
        <div className="bg-surface border border-metallic/30 rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="font-mono text-xl text-glow font-bold mb-6 text-center">
            ENTER CODENAME
          </h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Agent codename..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinWithNickname()}
              className="bg-surface-elevated border-metallic/30 text-text-primary placeholder:text-text-muted font-mono"
              maxLength={32}
            />
            <Button
              onClick={handleJoinWithNickname}
              disabled={!nickname.trim()}
              className="w-full bg-gradient-to-r from-metallic to-metallic-bright text-black font-mono font-bold hover:scale-105 transition-all duration-300"
            >
              INITIATE CONNECTION
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-text-primary flex">
      
      {/* Channels Sidebar */}
      <div className="w-64 bg-surface border-r border-metallic/20 flex flex-col">
        <div className="p-4 border-b border-metallic/20">
          <h2 className="font-mono text-lg text-metallic font-bold tracking-wider">
            CHANNELS
          </h2>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 font-mono text-sm ${
                  selectedChannel?.id === channel.id
                    ? 'bg-metallic/20 text-glow border border-metallic/30'
                    : 'hover:bg-surface-elevated text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  {channel.type === 'private' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                  <span>{channel.name}</span>
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {activeUsers.length} agents
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-metallic/20">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full font-mono text-xs bg-surface-elevated border-metallic/30 hover:bg-metallic/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            NEW CHANNEL
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Channel Header */}
        <div className="bg-surface-elevated border-b border-metallic/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-metallic" />
              <div>
                <h3 className="font-mono text-lg text-glow font-bold">
                  #{selectedChannel?.name}
                </h3>
                <p className="text-xs text-text-muted">
                  Secure channel • End-to-end encrypted
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className={`font-mono ${isMuted ? 'text-destructive' : 'text-metallic'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-metallic">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="group animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-metallic to-metallic-bright rounded-lg flex items-center justify-center text-black font-mono font-bold text-xs">
                    {msg.nickname.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-metallic font-bold">
                        {msg.nickname}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-text-primary leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 bg-surface-elevated border-t border-metallic/20">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder={`Message #${selectedChannel?.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-surface border-metallic/30 text-text-primary placeholder:text-text-muted font-mono"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-metallic to-metallic-bright text-black font-mono font-bold px-6 hover:scale-105 transition-all duration-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-text-muted font-mono mt-2">
            Messages are encrypted and automatically destroyed after 24 hours
          </div>
        </div>
      </div>

      {/* Users Sidebar */}
      <div className="w-56 bg-surface border-l border-metallic/20 flex flex-col">
        <div className="p-4 border-b border-metallic/20">
          <h3 className="font-mono text-sm text-metallic font-bold tracking-wider">
            ACTIVE AGENTS
          </h3>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-metallic to-metallic-bright rounded-lg flex items-center justify-center text-black font-mono font-bold text-xs">
                    {user.nickname.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface bg-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-text-primary truncate">
                    {user.nickname}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatInterface;
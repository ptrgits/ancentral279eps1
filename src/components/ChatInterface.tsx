import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

// Mock data - will be replaced with Supabase
const mockChannels = [
  { id: '1', name: 'general', type: 'public', users: 12 },
  { id: '2', name: 'operations', type: 'private', users: 5 },
  { id: '3', name: 'intel-reports', type: 'public', users: 8 },
  { id: '4', name: 'classified', type: 'private', users: 3 },
];

const mockMessages = [
  { id: '1', user: 'Agent_Alpha', message: 'Channel secured. Beginning transmission.', time: '14:23', type: 'system' },
  { id: '2', user: 'Agent_Bravo', message: 'Copy that. All units standing by.', time: '14:24', type: 'message' },
  { id: '3', user: 'Agent_Charlie', message: 'Surveillance grid is active. No anomalies detected.', time: '14:25', type: 'message' },
  { id: '4', user: 'Agent_Delta', message: 'Roger. Maintaining radio silence until further notice.', time: '14:26', type: 'message' },
];

const mockUsers = [
  { id: '1', name: 'Agent_Alpha', status: 'online', typing: false },
  { id: '2', name: 'Agent_Bravo', status: 'online', typing: true },
  { id: '3', name: 'Agent_Charlie', status: 'away', typing: false },
  { id: '4', name: 'Agent_Delta', status: 'online', typing: false },
];

const ChatInterface = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Will integrate with Supabase
      console.log('Sending message:', message);
      setMessage('');
    }
  };

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
            {mockChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.name)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 font-mono text-sm ${
                  selectedChannel === channel.name
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
                  {channel.users} agents
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
                  #{selectedChannel}
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
            {mockMessages.map((msg) => (
              <div key={msg.id} className="group animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-metallic to-metallic-bright rounded-lg flex items-center justify-center text-black font-mono font-bold text-xs">
                    {msg.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-metallic font-bold">
                        {msg.user}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-text-primary leading-relaxed">
                      {msg.message}
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
              placeholder={`Message #${selectedChannel}...`}
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
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-metallic to-metallic-bright rounded-lg flex items-center justify-center text-black font-mono font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-text-primary truncate">
                    {user.name}
                  </div>
                  {user.typing && (
                    <div className="text-xs text-metallic animate-pulse">
                      typing...
                    </div>
                  )}
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
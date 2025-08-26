-- Create channels table
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sessions table (for ephemeral sessions)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Channels are viewable by everyone" 
ON public.channels 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Messages are viewable by everyone" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "User sessions are viewable by everyone" 
ON public.user_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can create sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can update sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;

-- Insert default channels
INSERT INTO public.channels (name, type) VALUES 
('general', 'public'),
('operations', 'private'),
('intel-reports', 'public'),
('classified', 'private');
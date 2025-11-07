
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/firebase/utils';
import { collection, doc, setDoc, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Conversation = {
    id: string; // The user's UID
    userName: string;
    userAvatar?: string;
    lastMessage: string;
    lastMessageAt: any; // Firestore Timestamp
    isReadByAdmin: boolean;
};

type Message = {
    id: string;
    senderId: 'admin' | string; // User UID or 'admin'
    text: string;
    createdAt: any; // Firestore Timestamp
};


export default function ConversationsPage() {
  const firestore = useFirestore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  const conversationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'conversations'), orderBy('lastMessageAt', 'desc'));
  }, [firestore]);
  const { data: conversations, loading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  // Fetch messages for the selected conversation
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedConversationId) return null;
    return query(collection(firestore, 'conversations', selectedConversationId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, selectedConversationId]);
  const { data: messages, loading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Mark conversation as read
    if (firestore) {
        const convoRef = doc(firestore, 'conversations', conversationId);
        await setDoc(convoRef, { isReadByAdmin: true }, { merge: true });
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !firestore || !selectedConversationId) return;

      const messageText = newMessage;
      setNewMessage('');

      const conversationRef = doc(firestore, 'conversations', selectedConversationId);
      const messagesRef = collection(conversationRef, 'messages');

      const messagePayload = {
          senderId: 'admin',
          text: messageText,
          createdAt: serverTimestamp(),
      };

       const conversationPayload = {
            lastMessage: `Admin: ${messageText}`,
            lastMessageAt: serverTimestamp(),
        };

       try {
            await addDoc(messagesRef, messagePayload);
            await setDoc(conversationRef, conversationPayload, { merge: true });
        } catch (error) {
            console.error("Error sending message:", error);
        }
  }
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <Card className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
            {/* Conversation List */}
            <div className="flex flex-col border-r">
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {conversationsLoading ? (
                            <div className="p-3 space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : conversations.map(convo => {
                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => handleSelectConversation(convo.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                                        selectedConversationId === convo.id && "bg-muted"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            {convo.userAvatar && <AvatarImage src={convo.userAvatar} alt={convo.userName} />}
                                            <AvatarFallback>{convo.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {!convo.isReadByAdmin && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate">{convo.userName}</p>
                                        <p className={cn("text-sm text-muted-foreground truncate", !convo.isReadByAdmin && "font-bold text-foreground")}>{convo.lastMessage}</p>
                                    </div>
                                    {convo.lastMessageAt && <span className="text-xs text-muted-foreground">{formatDistanceToNow(convo.lastMessageAt.toDate(), { addSuffix: true })}</span>}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat View */}
            <div className="flex flex-col h-full">
                {selectedConversation ? (
                    <>
                        <div className="flex items-center gap-4 p-3 border-b">
                            <Avatar>
                                {selectedConversation.userAvatar && <AvatarImage src={selectedConversation.userAvatar} alt={selectedConversation.userName} />}
                                <AvatarFallback>{selectedConversation.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedConversation.userName}</p>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4" >
                            <div className="flex flex-col gap-4" ref={chatContainerRef}>
                                {messagesLoading ? (
                                    <p className="text-sm text-muted-foreground text-center">Loading messages...</p>
                                ) : (
                                    messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={cn("flex items-end gap-2", message.senderId === 'admin' ? "justify-end" : "justify-start")}
                                        >
                                            {message.senderId !== 'admin' && (
                                                <Avatar className="h-8 w-8">
                                                    {selectedConversation.userAvatar && <AvatarImage src={selectedConversation.userAvatar} alt={selectedConversation.userName} />}
                                                    <AvatarFallback>{selectedConversation.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={cn(
                                                "max-w-xs lg:max-w-md p-3 rounded-lg text-sm",
                                                message.senderId === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                <p>{message.text}</p>
                                                {message.createdAt && <p className="text-xs text-right mt-1 opacity-70">{formatDistanceToNow(message.createdAt.toDate())}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t">
                            <form className="flex gap-2" onSubmit={handleSendMessage}>
                                <Input 
                                    placeholder="Type your message..." 
                                    className="flex-1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-muted-foreground">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    </Card>
  );
}

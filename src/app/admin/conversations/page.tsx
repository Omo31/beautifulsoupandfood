
'use client';

import { useState } from 'react';
import { conversations as initialConversations } from '@/lib/data';
import type { Conversation, Message } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      // Mark as read
      setConversations(convs => convs.map(c => c.id === conversationId ? { ...c, unread: false } : c));
    }
  };

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
                        {conversations.map(convo => {
                            const avatar = PlaceHolderImages.find(p => p.id === convo.customerAvatarId);
                            return (
                                <button
                                    key={convo.id}
                                    onClick={() => handleSelectConversation(convo.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                                        selectedConversation?.id === convo.id && "bg-muted",
                                        convo.unread && "bg-primary/10"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            {avatar && <AvatarImage src={avatar.imageUrl} alt={convo.customerName} />}
                                            <AvatarFallback>{convo.customerName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {convo.unread && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate">{convo.customerName}</p>
                                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</span>
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
                                <AvatarImage src={PlaceHolderImages.find(p => p.id === selectedConversation.customerAvatarId)?.imageUrl} alt={selectedConversation.customerName} />
                                <AvatarFallback>{selectedConversation.customerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{selectedConversation.customerName}</p>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-col gap-4">
                                {selectedConversation.messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex items-end gap-2",
                                            message.sender === 'admin' && "justify-end"
                                        )}
                                    >
                                        {message.sender === 'customer' && (
                                             <Avatar className="h-8 w-8">
                                                <AvatarImage src={PlaceHolderImages.find(p => p.id === selectedConversation.customerAvatarId)?.imageUrl} alt={selectedConversation.customerName} />
                                                <AvatarFallback>{selectedConversation.customerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-xs lg:max-w-md p-3 rounded-lg",
                                            message.sender === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t">
                            <form className="flex gap-2">
                                <Input placeholder="Type your message..." className="flex-1" />
                                <Button type="submit" size="icon">
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

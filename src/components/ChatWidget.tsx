'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput, ChatOutput } from '@/ai/schemas/chat-schemas';

type Message = {
    role: 'user' | 'model';
    text: string;
};

export function ChatWidget() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const userMessage: Message = { role: 'user', text: newMessage };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsThinking(true);

        try {
            const chatHistory = [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: [{ text: msg.text }],
            }));
            
            const aiResponse: ChatOutput = await chat({ userId: user.uid, history: chatHistory });
            const aiMessage: Message = { role: 'model', text: aiResponse.response };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI chat failed:", error);
            const errorMessage: Message = { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
        
        // Also save the conversation for admin review
        saveConversation(userMessage.text);
    };

    const saveConversation = (lastMessageText: string) => {
        if (!firestore || !user) return;
        
        const conversationRef = doc(firestore, 'conversations', user.uid);
        const messagesRef = collection(conversationRef, 'messages');
        
        const messagePayload = {
            senderId: user.uid,
            text: lastMessageText,
            createdAt: serverTimestamp()
        };

        const conversationPayload = {
            userId: user.uid,
            userName: user.displayName || user.email,
            userAvatar: user.photoURL || '',
            lastMessage: lastMessageText,
            lastMessageAt: serverTimestamp(),
            isReadByAdmin: false
        };
        
        addDoc(messagesRef, messagePayload).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: messagesRef.path,
                operation: 'create',
                requestResourceData: messagePayload
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        
        setDoc(conversationRef, conversationPayload, { merge: true }).catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({
                path: conversationRef.path,
                operation: 'update',
                requestResourceData: conversationPayload
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };


    if (!user) {
        return null; // Don't show the widget if the user is not logged in
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" aria-label="Open chat">
                    <MessageSquare className="h-8 w-8" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-80 rounded-lg shadow-2xl p-0">
                <div className="flex flex-col h-96">
                    <div className="p-4 bg-primary text-primary-foreground rounded-t-lg">
                        <h3 className="font-bold text-lg">AI Assistant</h3>
                        <p className="text-sm">How can I help you today?</p>
                    </div>
                    <ScrollArea className="flex-1 bg-background" ref={chatContainerRef}>
                        <div className="p-4 flex flex-col gap-4">
                             <div className={cn("flex items-end gap-2", 'justify-start')}>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className={cn("max-w-xs p-3 rounded-lg text-sm", "bg-muted")}>
                                    <p>Hello! I'm the BeautifulSoup&Food AI assistant. Ask me about our products!</p>
                                </div>
                            </div>
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-end gap-2", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'model' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-xs p-3 rounded-lg text-sm",
                                        message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}>
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            ))}
                             {isThinking && (
                                <div className="flex items-end gap-2 justify-start">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-xs p-3 rounded-lg text-sm bg-muted">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t">
                        <form className="flex gap-2" onSubmit={handleSendMessage}>
                            <Input placeholder="Type a message..." className="flex-1" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <Button type="submit" disabled={!newMessage.trim() || isThinking}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

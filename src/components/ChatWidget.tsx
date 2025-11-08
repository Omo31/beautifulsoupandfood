'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/utils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Message = {
    id: string;
    senderId: 'admin' | string;
    text: string;
    createdAt: any;
};

export function ChatWidget() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        const messagesRef = collection(firestore, 'conversations', user.uid, 'messages');
        return query(messagesRef, orderBy('createdAt', 'asc'));
    }, [firestore, user]);

    const { data: messages, loading } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        // Scroll to the bottom when messages are loaded or new ones arrive
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);


    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !firestore || !user) return;

        const messageText = newMessage;
        setNewMessage('');

        const conversationRef = doc(firestore, 'conversations', user.uid);
        const messagesRef = collection(conversationRef, 'messages');
        
        const messagePayload = {
            senderId: user.uid,
            text: messageText,
            createdAt: serverTimestamp()
        };

        const conversationPayload = {
            userId: user.uid,
            userName: user.displayName || user.email,
            userAvatar: user.photoURL || '',
            lastMessage: messageText,
            lastMessageAt: serverTimestamp(),
            isReadByAdmin: false
        };
        
        // Optimistically add message to UI, though useCollection should handle this
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
                        <h3 className="font-bold text-lg">Chat with us</h3>
                        <p className="text-sm">We're here to help!</p>
                    </div>
                    <ScrollArea className="flex-1 bg-background" ref={chatContainerRef}>
                        <div className="p-4 flex flex-col gap-4">
                            {loading ? (
                                <p className="text-sm text-muted-foreground text-center">Loading chat...</p>
                            ) : messages.length === 0 ? (
                                 <div className="p-3 rounded-lg bg-muted max-w-xs text-sm">
                                    Hello! How can we help you today?
                                </div>
                            ) : (
                                messages.map(message => (
                                     <div key={message.id} className={cn("flex items-end gap-2", message.senderId !== 'admin' ? 'justify-end' : 'justify-start')}>
                                         {message.senderId === 'admin' && (
                                             <Avatar className="h-8 w-8">
                                                <AvatarFallback>A</AvatarFallback>
                                            </Avatar>
                                         )}
                                        <div className={cn(
                                            "max-w-xs p-3 rounded-lg text-sm",
                                            message.senderId !== 'admin' ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            <p>{message.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t">
                        <form className="flex gap-2" onSubmit={handleSendMessage}>
                            <Input placeholder="Type a message..." className="flex-1" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                            <Button type="submit" disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

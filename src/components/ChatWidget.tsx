'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from './ui/scroll-area';

export function ChatWidget() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
          aria-label="Open chat"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 rounded-lg shadow-2xl p-0"
      >
        <div className="flex flex-col h-96">
          <div className="p-4 bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-bold text-lg">Chat with us</h3>
            <p className="text-sm">We're here to help!</p>
          </div>
          <ScrollArea className="flex-1 p-4 bg-background">
            <div className="flex flex-col gap-3">
                <div className="flex items-end gap-2">
                    <div className="p-3 rounded-lg bg-muted max-w-xs">
                        <p className="text-sm">Hello! How can I help you today?</p>
                    </div>
                </div>
                 <div className="flex items-end gap-2 justify-end">
                    <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs">
                        <p className="text-sm">Hi, I have a question about my order.</p>
                    </div>
                </div>
            </div>
          </ScrollArea>
          <div className="p-2 border-t">
            <form className="flex gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

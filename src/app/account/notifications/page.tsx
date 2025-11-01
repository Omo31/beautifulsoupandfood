import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications from us.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="order-updates" className="text-base">Order Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive updates on your order status and delivery.</p>
                    </div>
                    <Switch id="order-updates" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="promotions" className="text-base">Promotions & Deals</Label>
                        <p className="text-sm text-muted-foreground">Get notified about special offers and new products.</p>
                    </div>
                    <Switch id="promotions" />
                </div>
                 <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="newsletter" className="text-base">Newsletter</Label>
                        <p className="text-sm text-muted-foreground">Receive our weekly newsletter with recipes and tips.</p>
                    </div>
                    <Switch id="newsletter" defaultChecked />
                </div>
                 <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="chat-messages" className="text-base">Chat Messages</Label>
                        <p className="text-sm text-muted-foreground">Get notified for new messages in your conversations.</p>
                    </div>
                    <Switch id="chat-messages" defaultChecked />
                </div>
                <Button>Save Preferences</Button>
            </CardContent>
        </Card>
    );
}

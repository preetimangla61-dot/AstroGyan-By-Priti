import { useGetAppointment, useVerifyPayment } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, ArrowLeft, Copy, Check, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const id = params.get("id");
  const { toast } = useToast();
  
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: appointmentData, isLoading: isLoadingAppt } = useGetAppointment(id || "", {
    query: { enabled: !!id }
  });

  const verifyPayment = useVerifyPayment();

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("8607723548@ybl");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "UPI ID Copied",
      description: "You can now paste it in your payment app.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !id) return;

    verifyPayment.mutate({
      data: {
        appointmentId: id,
        transactionId: transactionId.trim()
      }
    }, {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Could not verify transaction. Please try again or contact support."
        });
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full glass-panel border-primary/40 text-center py-8">
          <CardContent>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-serif text-primary mb-4">Payment Confirmed</h2>
            <p className="text-foreground/70 mb-8">
              Your consultation is successfully booked. A confirmation email has been sent to you.
            </p>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingAppt || !appointmentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      </div>
    );
  }

  const appt = appointmentData.appointment;
  const upiId = "8607723548@ybl";
  // The QR code API is as requested
  const qrUrl = `/api/qrcode?upiId=${upiId}&amount=${appt.amount}&name=PreetiManglaAstrology`;

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 md:px-8 relative">
      <div className="max-w-xl mx-auto">
        <button 
          onClick={() => setLocation(`/booking/summary?id=${id}`)}
          className="flex items-center text-sm text-foreground/60 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Summary
        </button>

        <Card className="glass-panel border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary font-serif">Complete Payment</CardTitle>
            <CardDescription className="text-base mt-2">
              Amount Due: <strong className="text-primary text-xl font-serif">₹{appt.amount}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center mb-8 bg-card/50 p-6 rounded-xl border border-border">
              <p className="text-sm text-foreground/60 mb-4 uppercase tracking-wider font-semibold">Scan to Pay via UPI</p>
              
              <div className="bg-white p-3 rounded-xl mb-6 inline-block shadow-lg">
                {/* Fallback styling in case image fails to load during dev */}
                <img 
                  src={qrUrl} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f1f1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14px' fill='%23666'%3EQR Code%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              <div className="flex items-center gap-3 bg-background px-4 py-3 rounded-lg border border-border w-full justify-between">
                <div>
                  <p className="text-xs text-foreground/50">UPI ID</p>
                  <p className="font-medium text-primary tracking-wide">{upiId}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopyUPI}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction / UTR Reference Number</Label>
                <Input
                  id="transactionId"
                  placeholder="e.g. 312456789012"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-14 font-mono text-center text-lg tracking-wider"
                  required
                />
                <p className="text-xs text-foreground/50 text-center mt-2">
                  Enter the 12-digit reference number from your payment app after completing the transfer.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg h-14"
                disabled={verifyPayment.isPending || !transactionId.trim()}
              >
                {verifyPayment.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify Payment"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

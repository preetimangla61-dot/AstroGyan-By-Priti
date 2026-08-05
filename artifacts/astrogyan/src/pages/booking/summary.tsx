import { useGetAppointment } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Clock, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { consultationTypes } from "@/lib/schema";

export default function Summary() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const id = params.get("id");

  const { data: appointmentData, isLoading, error } = useGetAppointment(id || "", {
    query: { enabled: !!id }
  });

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Invalid booking reference.</p>
            <Button variant="outline" onClick={() => setLocation("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-primary font-serif text-xl animate-pulse">Consulting the charts...</p>
      </div>
    );
  }

  if (error || !appointmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Could not load appointment details.</p>
            <Button variant="outline" onClick={() => setLocation("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appt = appointmentData.appointment;
  const consultType = consultationTypes.find(t => t.id === appt.consultationType)?.label || appt.consultationType;

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 md:px-8 relative">
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] -z-10" />
      
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center text-sm text-foreground/60 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <Card className="glass-panel border-primary/30">
          <CardHeader className="text-center pb-2">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl text-primary">Booking Summary</CardTitle>
            <p className="text-foreground/70 mt-2">Please review your details before proceeding to payment.</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm uppercase tracking-widest text-secondary font-semibold border-b border-border/50 pb-2">Your Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-foreground/50 w-24 inline-block">Name:</span> {appt.fullName}</p>
                  <p><span className="text-foreground/50 w-24 inline-block">Email:</span> {appt.email}</p>
                  <p><span className="text-foreground/50 w-24 inline-block">Phone:</span> {appt.phone}</p>
                  <p><span className="text-foreground/50 w-24 inline-block">Gender:</span> {appt.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm uppercase tracking-widest text-secondary font-semibold border-b border-border/50 pb-2">Birth Details</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary/70" /> {format(new Date(appt.dob), "PPP")}</p>
                  <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-primary/70" /> {appt.timeOfBirth}</p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary/70" /> {appt.placeOfBirth}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
              <h4 className="text-sm uppercase tracking-widest text-secondary font-semibold mb-4">Consultation</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="font-serif text-xl">{consultType}</span>
                <span className="font-serif text-2xl text-primary">₹{appt.amount}</span>
              </div>
              <div className="text-sm text-foreground/70 flex items-center gap-4 mt-4">
                <span className="flex items-center bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {format(new Date(appt.appointmentDate), "PPP")}
                </span>
                <span className="flex items-center bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {appt.appointmentTime}
                </span>
              </div>
            </div>

          </CardContent>
          <CardFooter className="p-6 md:p-8 pt-0 flex-col gap-4">
            <Button 
              size="lg" 
              className="w-full text-lg"
              onClick={() => setLocation(`/booking/payment?id=${appt.id}`)}
            >
              Proceed to Payment
            </Button>
            <p className="text-xs text-foreground/40 text-center">
              Your appointment is held for 15 minutes pending payment.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useListAppointments, useUpdateAppointmentStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, Lock, Download, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [adminCode, setAdminCode] = useState(() => sessionStorage.getItem("adminCode") || "");
  const [inputCode, setInputCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(!!adminCode);
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, isError, refetch } = useListAppointments({
    query: { 
      enabled: isAuthenticated,
      retry: false,
    },
    headers: { 'x-admin-code': adminCode }
  });

  const updateStatus = useUpdateAppointmentStatus();

  useEffect(() => {
    if (isError) {
      setIsAuthenticated(false);
      sessionStorage.removeItem("adminCode");
      setAdminCode("");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid or expired admin code."
      });
    }
  }, [isError, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setAdminCode(inputCode.trim());
      sessionStorage.setItem("adminCode", inputCode.trim());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminCode");
    setAdminCode("");
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateStatus.mutate(
      { 
        id, 
        data: { status: newStatus }
      },
      {
        onSuccess: () => {
          toast({ title: "Status Updated", description: "Appointment status has been updated." });
          refetch();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        }
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
        <Card className="w-full max-w-sm glass-panel border-primary/20 relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl text-primary">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Enter access code" 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="text-center h-12 text-lg tracking-widest"
              />
              <Button type="submit" className="w-full h-12">Enter Sanctuary</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointments = data?.appointments || [];
  const filteredAppointments = statusFilter === "all" 
    ? appointments 
    : appointments.filter(a => a.status === statusFilter);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card/40 p-6 rounded-2xl border border-border backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-serif text-primary">AstroGyan Admin</h1>
            <p className="text-sm text-foreground/50">Manage your consultations</p>
          </div>
          <div className="flex gap-4 items-center">
            <Button 
              variant="outline" 
              className="border-primary/20 hover:bg-primary/10"
              onClick={() => window.open(`/api/appointments/export?code=${adminCode}`, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" onClick={handleLogout}>Lock Session</Button>
          </div>
        </header>

        <Card className="glass-panel overflow-hidden border-border/50">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground/70">Filter:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="paid">Paid (Upcoming)</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-foreground/50">
              Total: {filteredAppointments.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center p-12 text-foreground/50 italic">
                No appointments found for the selected criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Consultation</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map(appt => (
                    <TableRow key={appt.id}>
                      <TableCell>
                        <div className="font-medium text-primary-foreground/90">{appt.fullName}</div>
                        <div className="text-xs text-foreground/50">{appt.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{appt.consultationType}</div>
                        <div className="text-xs text-foreground/50">₹{appt.amount}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(appt.appointmentDate), "MMM dd, yyyy")}</div>
                        <div className="text-xs text-primary">{appt.appointmentTime}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          appt.status === 'paid' ? 'success' : 
                          appt.status === 'completed' ? 'secondary' : 
                          appt.status === 'pending_payment' ? 'outline' : 'destructive'
                        }>
                          {appt.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {appt.status === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-green-500/30 text-green-500 hover:bg-green-500/10"
                              onClick={() => handleStatusChange(appt.id, 'completed')}
                              disabled={updateStatus.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Done
                            </Button>
                          )}
                          {(appt.status === 'paid' || appt.status === 'pending_payment') && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(appt.id, 'cancelled')}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

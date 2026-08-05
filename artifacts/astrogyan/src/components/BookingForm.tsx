import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { bookingFormSchema, BookingFormValues, consultationTypes } from "@/lib/schema"
import { useCreateAppointment, useGetSlots } from "@workspace/api-client-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation } from "wouter"
import { cn } from "@/lib/utils"

export function BookingForm() {
  const [, setLocation] = useLocation();
  const createAppointment = useCreateAppointment();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "+91",
      dob: "",
      timeOfBirth: "",
      placeOfBirth: "",
      gender: undefined,
      consultationType: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: ""
    }
  });

  const selectedDate = form.watch("appointmentDate");
  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlots(
    { date: selectedDate },
    { query: { enabled: !!selectedDate } }
  );

  // Clear time when date changes
  useEffect(() => {
    form.setValue("appointmentTime", "");
  }, [selectedDate, form]);

  const onSubmit = (data: BookingFormValues) => {
    createAppointment.mutate(
      { data },
      {
        onSuccess: (res) => {
          setLocation(`/booking/summary?id=${res.appointment.id}`);
        }
      }
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="glass-panel w-full max-w-3xl mx-auto border-primary/20">
      <CardContent className="p-8 md:p-12">
        <div className="text-center mb-10">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-3">Begin Your Journey</h2>
          <p className="text-foreground/70">Share your birth details for an accurate astrological reading.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-secondary border-b border-border/50 pb-2">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91XXXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Birth Details */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-serif text-secondary border-b border-border/50 pb-2">Birth Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" max={today} className="w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of Birth</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City/Town of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Consultation */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-serif text-secondary border-b border-border/50 pb-2">Consultation</h3>
              <FormField
                control={form.control}
                name="consultationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Guidance Needed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14">
                          <SelectValue placeholder="Select consultation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {consultationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex justify-between items-center w-full min-w-[200px]">
                              <span>{type.label}</span>
                              <span className="text-primary font-medium ml-4">₹{type.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input type="date" min={today} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Time Slots</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {!selectedDate ? (
                            <div className="col-span-3 text-sm text-muted-foreground p-3 border border-dashed border-border rounded-md text-center">
                              Select a date first
                            </div>
                          ) : isLoadingSlots ? (
                            <div className="col-span-3 flex justify-center py-2">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : slotsData?.slots.length ? (
                            slotsData.slots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => field.onChange(slot.time)}
                                className={cn(
                                  "py-2 text-sm rounded-md border transition-all",
                                  slot.available
                                    ? field.value === slot.time
                                      ? "bg-primary border-primary text-primary-foreground shadow-md"
                                      : "border-border hover:border-primary/50 text-foreground"
                                    : "opacity-40 cursor-not-allowed border-border/50 bg-muted/20"
                                )}
                              >
                                {slot.time}
                              </button>
                            ))
                          ) : (
                            <div className="col-span-3 text-sm text-muted-foreground">
                              No slots available
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Questions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What specific areas of life would you like Preeti to focus on?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg mt-8"
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Booking your reading...
                </>
              ) : (
                "Proceed to Summary"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

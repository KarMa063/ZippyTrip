import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../gcomponents/card";
import { Button } from "../gcomponents/button";
import { MessageSquare, Plus, Home, BarChart3, Calendar, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import axios from "axios";

interface Property {
  id: number;
  name: string;
  description: string;
  address: string;
  email: string;
  phoneNumber: string;
  images: string[];
  rooms: any[];
}

interface Booking {
  id: string;
  traveller_id: string;
  property_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'declined';
  traveller_email?: string;
  property_name?: string;
}

const GDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const stats = [
    { title: "Total Properties", value: properties.length.toString(), icon: <Home className="h-5 w-5 text-blue-500" /> },
    { 
      title: "Active Bookings", 
      value: bookings.filter(b => b.status.toLowerCase() === 'confirmed').length.toString(), 
      icon: <Calendar className="h-5 w-5 text-green-500" /> 
    },
    { 
      title: "Pending Requests", 
      value: bookings.filter(b => b.status.toLowerCase() === 'pending').length.toString(), 
      icon: <BarChart3 className="h-5 w-5 text-yellow-500" /> 
    },
    { title: "Total Revenue", value: "NRs. 425,000", icon: <DollarSign className="h-5 w-5 text-purple-500" /> },
  ];

  const recentMessages = [
    { id: 1, guest: "John Doe", message: "Hi, I have a question about the Himalyan Retreat.", time: "10:23 AM", isRead: true, sentByMe: false },
    { id: 2, guest: "Jane Smith", message: "Thanks for the information!", time: "Yesterday", isRead: false, sentByMe: false },
    { id: 3, guest: "Sandra Williams", message: "I've sent over the booking confirmation.", time: "5 days ago", isRead: true, sentByMe: true },
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/gproperties/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    const fetchBookings = async () => {
      try {
        const bookingsResponse = await axios.get('http://localhost:5000/api/bookings');
        const bookingsData = bookingsResponse.data.bookings;

        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: Booking) => {
            try {
              const [user, property] = await Promise.all([
                axios.get(`http://localhost:5000/api/users/${booking.traveller_id}`),
                axios.get(`http://localhost:5000/api/gproperties/${booking.property_id}`),
              ]);
              
              return {
                ...booking,
                traveller_email: user.data.user.user_email,
                property_name: property.data.property.name,
              };
            } catch (error) {
              console.error(`Error enriching booking ${booking.id}:`, error);
              return {
                ...booking,
                traveller_email: 'Not available',
                property_name: 'Not available',
              };
            }
          })
        );
        
        setBookings(enrichedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
    fetchProperties();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your properties and bookings</p>
        </div>
        <Button onClick={() => navigate("/gproperties/add")} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription>{stat.title}</CardDescription>
              <div className="rounded-full p-2 bg-primary/10">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Properties</CardTitle>
              <CardDescription>Manage your properties</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/gproperties")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/gproperties/${property.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{property.name}</h3>
                    <p className="text-sm text-muted-foreground">{property.address}</p>
                  </div>
                  <div className="text-sm">
                    <div>{property.rooms} Rooms</div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5"
                onClick={() => navigate("/gproperties/add")}
              >
                <Plus className="h-4 w-4" />
                <span>Add New Property</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest booking activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/gbookings")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium">
                  <th className="pb-3 pr-4">Property</th>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-b text-sm">
                      <td className="py-3 pr-4">{booking.property_name}</td>
                      <td className="py-3 pr-4">{booking.traveller_email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-sm text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Recent conversations with your guests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Messages</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="sent">Sent by You</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm">{message.guest}</h4>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                    <p
                      className={`text-sm ${
                        !message.isRead ? "font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {message.sentByMe && "You: "}
                      {message.message}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/messages")}
              >
                View All Messages
              </Button>
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {recentMessages
                .filter((m) => !m.isRead)
                .map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageSquare className="h-5 w-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">{message.guest}</h4>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm font-medium">{message.message}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {recentMessages
                .filter((m) => m.sentByMe)
                .map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/messages")}
                  >
                    <MessageSquare className="h-5 w-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">{message.guest}</h4>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">You: {message.message}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDashboard;

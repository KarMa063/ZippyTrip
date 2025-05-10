import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../gcomponents/button";
import { Card, CardContent, CardHeader, CardTitle } from "../gcomponents/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import { Badge } from "../gcomponents/badge";
import { Separator } from "../gcomponents/separator";
import { CalendarDays, Star, BedDouble, UserCheck, BarChart, MessageSquare, ArrowLeft, Edit, Trash, Plus } from "lucide-react";
import axios from "axios";

interface Booking {
  id: number;
  traveller_id: string;
  room_id: number;
  check_in: string;
  check_out: string;
  status: string;
  traveller_email?: string;
  room_name?: string;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  user_id?: string;
  email?: string;
  ownerReply?: string;
}

const PropertyDetails = () => {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propertyRes, roomsRes, bookingsRes, reviewsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/gproperties/${propertyId}`),
          fetch(`http://localhost:5000/api/gproperties/${propertyId}/rooms`),
          fetch(`http://localhost:5000/api/bookings/property/${propertyId}`),
          fetch(`http://localhost:5000/api/gproperties/${propertyId}/reviews`)
        ]);

        if (!propertyRes.ok || !roomsRes.ok || !bookingsRes.ok || !reviewsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [propertyData, roomsData, bookingsData, reviewsData] = await Promise.all([
          propertyRes.json(),
          roomsRes.json(),
          bookingsRes.json(),
          reviewsRes.json()
        ]);

        // Enrich bookings data
        const enrichedBookings = await Promise.all(
          bookingsData.bookings.map(async (booking: Booking) => {
            try {
              const [user, room] = await Promise.all([
                axios.get(`http://localhost:5000/api/users/${booking.traveller_id}`),
                axios.get(`http://localhost:5000/api/gproperties/${propertyId}/rooms/${booking.room_id}`),
              ]);
              return {
                ...booking,
                traveller_email: user.data.user.user_email,
                room_name: room.data.room.name,
              };
            } catch (error) {
              console.error(`Error enriching booking ${booking.id}:`, error);
              return {
                ...booking,
                traveller_email: 'Not available',
                room_name: 'Not available',
              };
            }
          })
        );

        // Calculate stats
        const totalRooms = roomsData.rooms.length;
        const occupiedRooms = roomsData.rooms.filter((room: any) => !room.available).length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        const averageRating = reviewsData.reviews.length > 0
          ? reviewsData.reviews.reduce((total: number, review: Review) => total + Number(review.rating), 0) / reviewsData.reviews.length
          : 0;

        setProperty({
          ...propertyData.property,
          totalRooms: totalRooms,
          occupiedRooms,
          occupancyRate,
          rooms: roomsData.rooms,
          bookings: enrichedBookings,
          reviews: reviewsData.reviews,
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews: reviewsData.reviews.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/gproperties/${propertyId}/rooms/${roomId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to delete room");
      }
  
      setProperty((prev: any) => ({
        ...prev,
        rooms: prev.rooms.filter((room: any) => room.id !== roomId),
        totalRooms: prev.totalRooms - 1,
        occupiedRooms: prev.rooms.filter((room: any) => !room.available && room.id !== roomId).length,
        occupancyRate: prev.totalRooms - 1 > 0
          ? Math.round((prev.rooms.filter((room: any) => !room.available && room.id !== roomId).length / (prev.totalRooms - 1)) * 100)
          : 0,
      }));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Could not delete room.");
    }
  };

  const handleReplySubmit = async (reviewId: number) => {
    if (!replyText[reviewId] || replyText[reviewId].trim() === '') {
      alert("Reply cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/gproperties/${propertyId}/reviews/${reviewId}/reply`,
        { ownerReply: replyText[reviewId] }
      );

      if (response.data.success) {
        setProperty((prev: any) => ({
          ...prev,
          reviews: prev.reviews.map((review: Review) =>
            review.id === reviewId
              ? { ...review, response: replyText[reviewId] }
              : review
          ),
        }));
        setReplyText({ ...replyText, [reviewId]: '' });
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to submit reply");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}</span>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><p>Loading...</p></div>;
  }

  if (!property) {
    return <div className="flex items-center justify-center h-96"><p>Property not found</p></div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/gproperties")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{property.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/gproperties/edit/${propertyId}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={property.images} 
                alt={property.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
              <p className="text-muted-foreground mb-4">{property.address}</p>
              <p className="mb-4">{property.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div><span className="font-semibold">Contact: </span>{property.contact}</div>
                <div><span className="font-semibold">Email: </span>{property.email}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Property Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-blue-500" /><span>Total Rooms</span></div>
                <span className="font-bold">{property.totalRooms}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-500" /><span>Occupied Rooms</span></div>
                <span className="font-bold">{property.occupiedRooms}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><BarChart className="h-5 w-5 text-purple-500" /><span>Occupancy Rate</span></div>
                <Badge variant="outline" className="font-bold">{property.occupancyRate}%</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /><span>Average Rating</span></div>
                <div className="flex items-center">{renderStars(property.averageRating)}<span className="ml-2 text-sm text-muted-foreground">({property.totalReviews})</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rooms"><BedDouble className="h-4 w-4 mr-1" /> Rooms</TabsTrigger>
          <TabsTrigger value="bookings"><CalendarDays className="h-4 w-4 mr-1" /> Bookings</TabsTrigger>
          <TabsTrigger value="reviews"><MessageSquare className="h-4 w-4 mr-1" /> Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Rooms</h2>
            <Button onClick={() => navigate(`/gproperties/${propertyId}/add-room`)}>
              <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {property.rooms.map((room: any) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={room.images} 
                    alt={room.name} 
                    className="h-48 w-full object-cover rounded-t-lg"
                  />
                  <Badge 
                    variant={room.available ? "outline" : "secondary"} 
                    className="absolute top-2 right-2 shadow-sm"
                  >
                    {room.available ? "Available" : "Occupied"}
                  </Badge>
                </div>
                
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {room.name}
                    </h3>
                    <span className="text-lg font-bold text-primary">
                      Rs. {room.price || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    <span>Capacity: {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}</span>
                  </div>
                  
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((a: string, i: number) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-xs py-1 px-2 rounded-full"
                          >
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => navigate(`/gproperties/${propertyId}/rooms/${room.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Bookings</h2>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium">
                    <th className="p-4">Guest Email</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Check-in</th>
                    <th className="p-4">Check-out</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {property.bookings.length > 0 ? (
                    property.bookings.map((booking: Booking) => (
                      <tr key={booking.id} className="border-b hover:bg-accent/20 transition-colors">
                        <td className="p-4 font-medium">{booking.traveller_email || 'Not available'}</td>
                        <td className="p-4 text-sm">{booking.room_name || 'Not available'}</td>
                        <td className="p-4 text-sm">{new Date(booking.check_in).toLocaleDateString()}</td>
                        <td className="p-4 text-sm">{new Date(booking.check_out).toLocaleDateString()}</td>
                        <td className="p-4">
                          <Badge variant={
                            booking.status === "confirmed" ? "success" : 
                            booking.status === "pending" ? "outline" :
                            booking.status === "cancelled" ? "destructive" :
                            booking.status === "declined" ? "destructive" :
                            "secondary"
                          }>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

       <TabsContent value="reviews">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Guest Reviews</h2>
          <div className="flex items-center gap-2">
            <span>Average Rating:</span>
            {renderStars(property.averageRating)}
            <span className="text-sm text-muted-foreground">({property.totalReviews})</span>
          </div>
        </div>

        <div className="space-y-4">
          {property.reviews?.length > 0 ? (
            property.reviews.map((review: Review) => (
              <Card key={review.id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{review.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p>{review.comment}</p>

                  {/* Owner response section*/}
                  {review.ownerReply ? (
                    <div className="mt-3 pl-4 border-l-2 border-muted">
                      <p className="font-medium">Owner's Response:</p>
                      <p>{review.ownerReply}</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Write a response..."
                        className="w-full p-2 text-sm border rounded"
                        value={replyText[review.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReplySubmit(review.id)}
                      >
                        Submit Response
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetails;

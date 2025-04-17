import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../gcomponents/button";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from "../gcomponents/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../gcomponents/tabs";
import { Badge } from "../gcomponents/badge";
import { Separator } from "../gcomponents/separator";
import { 
  Home, 
  CalendarDays, 
  Star, 
  BedDouble, 
  UserCheck, 
  BarChart, 
  MessageSquare,
  ArrowLeft, 
  Edit,
  Trash,
  Plus 
} from "lucide-react";
import guesthouse1 from "../images/guesthouse1.jpg";
import room1 from "../images/room1.jpg";
import room2 from "../images/room2.jpg";

// Mock property data
const initialProperties = [
  {
    id: "1",
    name: "Himalayan Retreat",
    address: "Lakeside, Pokhara, Kaski",
    description: "A beautiful lakeside property with a mountain view.",
    contact: "9800000001",
    email: "himalayan@zippytrip.com",
    images: [guesthouse1],
    totalRooms: 4,
    occupiedRooms: 3,
    occupancyRate: 75,
    averageRating: 4.7,
    totalReviews: 12,
    rooms: [
      { id: "r1", name: "Master Suite", capacity: 2, available: false, image: room1 },
      { id: "r2", name: "Guest Room 1", capacity: 2, available: true, image: room2 }
    ],
    bookings: [
      { id: "b1", guestName: "John Doe", checkIn: "2025-04-12", checkOut: "2025-04-15", room: "Master Suite", status: "Confirmed" },
      { id: "b2", guestName: "Jane Smith", checkIn: "2025-04-18", checkOut: "2025-04-25", room: "Guest Room 2", status: "Pending" },
      { id: "b3", guestName: "Robert Johnson", checkIn: "2025-05-01", checkOut: "2025-05-05", room: "Family Room", status: "Confirmed" }
    ],
    reviews: [
      { id: "rev1", guestName: "Sarah M.", rating: 5, date: "2025-03-15", comment: "Amazing view and excellent service!" },
      { id: "rev2", guestName: "Thomas B.", rating: 4, date: "2025-03-10", comment: "Very comfortable stay, highly recommended." },
      { id: "rev3", guestName: "Emily L.", rating: 5, date: "2025-02-22", comment: "Perfect location and beautiful property!" }
    ]
  },
];

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("rooms");

  useEffect(() => {
    const foundProperty = initialProperties.find(p => p.id === id);
    if (foundProperty) {
      setProperty(foundProperty);
    }
  }, [id]);

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}</span>
    </div>
  );

  if (!property) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Loading property details...</p>
      </div>
    );
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
          <Button variant="outline" onClick={() => navigate(`/gproperties/edit/${id}`)}>
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
                src={property.images[0]} 
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
            <Button onClick={() => navigate(`/gproperties/${property.id}/add-room`)}>
              <Plus className="h-4 w-4 mr-2" /> Add Room
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {property.rooms.map((room: any) => (
              <Card key={room.id} className="overflow-hidden">
                <img 
                  src={room.image || guesthouse1} 
                  alt={room.name} 
                  className="h-40 w-full object-cover" 
                />
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                    </div>
                    <Badge variant={room.available ? "outline" : "secondary"}>
                      {room.available ? "Available" : "Occupied"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room Capacity</span>
                    <span className="font-medium">{room.capacity}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">Rs. {room.price || "N/A"}</span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Amenities:</span>
                    <ul className="list-disc list-inside text-sm ml-2 mt-1">
                      {(room.amenities || []).map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                      {(!room.amenities || room.amenities.length === 0) && (
                        <li className="text-muted-foreground">No amenities listed</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-1" /> Delete
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
            <Button><Plus className="h-4 w-4 mr-2" /> New Booking</Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium">
                    <th className="p-4">Guest</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Check-in</th>
                    <th className="p-4">Check-out</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {property.bookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b hover:bg-accent/20 transition-colors">
                      <td className="p-4 font-medium">{booking.guestName}</td>
                      <td className="p-4 text-sm">{booking.room}</td>
                      <td className="p-4 text-sm">{booking.checkIn}</td>
                      <td className="p-4 text-sm">{booking.checkOut}</td>
                      <td className="p-4">
                        <Badge variant={booking.status === "Confirmed" ? "success" : "outline"}>
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Guest Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="font-medium">Average Rating:</span>
              {renderStars(property.averageRating)}
              <span className="ml-1 text-sm text-muted-foreground">({property.totalReviews} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {property.reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{review.guestName}</div>
                      <div className="text-sm text-muted-foreground">{review.date}</div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="mt-3">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyDetails;

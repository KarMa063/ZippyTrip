import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../gcomponents/button";
import { Card, CardContent, CardHeader, CardTitle } from "../gcomponents/card";
import { Input } from "../gcomponents/input";
import { Label } from "../gcomponents/label";
import { Textarea } from "../gcomponents/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../gcomponents/select";
import { ArrowLeft } from "lucide-react";
import { FaCloudUploadAlt } from 'react-icons/fa'; // Import the cloud upload icon
import { useDropzone } from "react-dropzone"; // Importing react-dropzone

const AddRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState("true");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<string[]>([]); // To hold uploaded images

  // Handle image uploads (drag-and-drop or file input)
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...newImages]);
    },
    accept: {
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
      },
    multiple: true,
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom = {
      id: `r${Date.now()}`,
      name,
      capacity: parseInt(capacity.toString()),
      price,
      available: available === "true",
      amenities: amenities.split(",").map((a) => a.trim()).filter(Boolean),
      images, // Add images array to the new room
    };

    const roomKey = `rooms-${id}`;
    const existingRooms = JSON.parse(localStorage.getItem(roomKey) || "[]");
    const updatedRooms = [...existingRooms, newRoom];
    localStorage.setItem(roomKey, JSON.stringify(updatedRooms));

    navigate(`/gproperties/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(`/gproperties/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Add New Room</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Room Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room Name */}
            <div>
              <Label>Room Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Room Capacity */}
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min={1}
                required
              />
            </div>

            {/* Room Price */}
            <div>
              <Label>Price (Rs.)</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            {/* Room Availability */}
            <div>
              <Label>Availability</Label>
              <Select value={available} onValueChange={setAvailable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Room Amenities */}
            <div>
              <Label>Amenities (comma-separated)</Label>
              <Textarea
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="WiFi, AC, TV, Heater"
              />
            </div>

            {/* Room Image Upload with Drag-and-Drop */}
            <div>
              <Label>Room Images</Label>
              <div
                {...getRootProps()}
                className="border-dashed border-2 rounded-lg p-6 text-center cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <FaCloudUploadAlt className="w-6 h-6" />
                  <p className="text-sm">Drag & drop images here, or click to select files</p>
                  <p className="text-xs text-muted-foreground">JPEG, JPG, PNG, or WebP (max 10 images)</p>
                </div>
              </div>

              {/* Display uploaded images */}
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Uploaded ${i}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("drag-index", i.toString())}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const draggedFrom = parseInt(e.dataTransfer.getData("drag-index"));
                        const draggedTo = i;
                        if (draggedFrom === draggedTo) return;
                        const updated = [...images];
                        const [moved] = updated.splice(draggedFrom, 1);
                        updated.splice(draggedTo, 0, moved);
                        setImages(updated);
                      }}
                      className="rounded-lg h-28 object-cover w-full cursor-move border"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <img src="/placeholder.svg" className="mx-auto h-20 opacity-30" alt="No images" />
                  <p>No images uploaded</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Add Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRoom;

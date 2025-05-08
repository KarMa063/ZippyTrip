import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { Input } from "../gcomponents/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../gcomponents/select";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import placeholderImage from "../images/placeholder.png";

type FileWithPreview = File & { preview: string };

export default function EditRoom() {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const form = useForm();
  const [images, setImages] = useState<(string | FileWithPreview)[]>([]);
  const [available, setAvailable] = useState("true");
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/gproperties/${id}/rooms/${roomId}`);
        const data = await response.json();

        if (data.success) {
          const room = data.room;
          form.setValue("name", room.name);
          form.setValue("capacity", room.capacity);
          form.setValue("price", room.price);
          form.setValue("amenities", room.amenities?.join(", ") || "");
          setAvailable(room.available ? "true" : "false");
          setImages(room.images || []);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        setNotFound(true);
      }
    };

    fetchRoom();
  }, [id, roomId, form]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ) as FileWithPreview[];
      setImages((prev) => [...prev, ...filesWithPreview].slice(0, 10));
    },
  });
  
  const onSubmit = async (data: any) => {
    const updatedRoom = {
      id,
      name: data.name,
      capacity: parseInt(data.capacity, 10) || 1,
      price: data.price,
      available: available === "true",
      amenities: data.amenities
        .split(",")
        .map((a: string) => a.trim())
        .filter(Boolean),
    };
  
    try {
      const url = `http://localhost:5000/api/gproperties/${id}/rooms/${roomId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRoom),
      });
  
      // Check for bad response before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Raw error response:", errorText);
        alert(`Failed to update room. Server returned ${response.status}`);
        return;
      }
  
      const result = await response.json();
  
      if (result.success) {
        alert("Room updated successfully!");
        navigate(`/gproperties/${id}`);
      } else {
        alert(`Error updating room: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An unexpected error occurred while updating the room.");
    }
  };  

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Room</h1>
        <p className="text-muted-foreground">Update your room details</p>
      </div>

      {notFound && <p className="text-red-500">Room not found or error fetching details.</p>}

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Room Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Room Name
          </label>
          <Input
            id="name"
            placeholder="e.g. Ocean View Room"
            {...form.register("name", { required: "Room name is required" })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="capacity">
            Room Capacity
          </label>
          <Input
            id="capacity"
            type="number"
            min="1"
            {...form.register("capacity", { required: "Room capacity is required" })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="price">
            Room Price (Rs.)
          </label>
          <Input
            id="price"
            {...form.register("price", { required: "Room price is required" })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="available">
            Availability
          </label>
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
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="amenities">
            Amenities
          </label>
          <Textarea
            id="amenities"
            placeholder="WiFi, AC, TV"
            {...form.register("amenities", { required: "Room amenities are required" })}
          />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Room Images</h2>
        <div
          {...getRootProps()}
          className="border-dashed border-2 rounded-lg p-6 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            <p className="text-sm">Drag & drop images here, or click to select files</p>
            <p className="text-xs text-muted-foreground">JPEG, JPG, PNG, or WebP (max 10 images)</p>
          </div>
        </div>
        {/* Display uploaded images */}
        {/* {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={typeof img === "string" ? img : img.preview}
                alt={`Uploaded image ${i}`}
                className="rounded-lg h-28 object-cover w-full"
              />
            ))}
          </div>
        )}
        {images.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            <img src={placeholderImage} className="mx-auto h-20 opacity-30" alt="No images" />
            <p>No images uploaded</p>
          </div>
        )} */}
      </section>

      <div className="text-right">
        <Button type="submit">Update Room</Button>
      </div>
    </form>
  );
}

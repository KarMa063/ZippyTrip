import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../gcomponents/input";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import placeholderImage from "../images/placeholder.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../gcomponents/select";
import { Label } from "../gcomponents/label";

export default function AddRoom() {
  const { id } = useParams();
  const form = useForm();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [available, setAvailable] = useState("true");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      const imagePreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setImages((prev) => [...prev, ...imagePreviews].slice(0, 10));
    },
  });

  const onSubmit = async (data: any) => {
    const roomData = {
      name: data.name,
      capacity: parseInt(data.capacity, 10) || 1,
      price: data.price,
      available: available === "true",
      amenities: data.amenities
        .split(",")
        .map((a: string) => a.trim())
        .filter(Boolean),
      images: images,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/gproperties/${id}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roomData),
        }
      );

      if (response.ok) {
        alert("Room added successfully!");
        navigate(`/gproperties/${id}`);
      } else {
        alert("Failed to add room. Please try again.");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold">Add New Room</h1>
        <p className="text-muted-foreground">
          Create a new room for the property
        </p>
      </div>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Room Information</h2>
        <div>
          <Label>Room Name</Label>
          <Input placeholder="e.g. Ocean View Room" {...form.register("name")} />
        </div>
        <div>
          <Label>Room Capacity</Label>
          <Input type="number" min="1" {...form.register("capacity")} />
        </div>
        <div>
          <Label>Room Price (Rs.)</Label>
          <Input placeholder="Price in Rs." {...form.register("price")} />
        </div>
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
        <div>
          <Label>Amenities</Label>
          <Textarea
            placeholder="WiFi, AC, TV"
            {...form.register("amenities")}
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
            <p className="text-sm">
              Drag & drop images here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, JPG, PNG, or WebP (max 10 images)
            </p>
          </div>
        </div>

        {/* {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Uploaded ${i}`}
                className="rounded-lg h-28 object-cover w-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <img
              src={placeholderImage}
              className="mx-auto h-20 opacity-30"
              alt="No images"
            />
            <p>No images uploaded</p>
          </div>
        )} */}
      </section>

      <div className="text-right">
        <Button type="submit">Create Room</Button>
      </div>
    </form>
  );
}

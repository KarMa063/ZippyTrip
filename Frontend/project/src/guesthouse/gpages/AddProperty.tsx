import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../gcomponents/input";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import placeholderImage from "../images/placeholder.png";

export default function AddProperty() {
  const form = useForm();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      const imagePreviews = acceptedFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...imagePreviews].slice(0, 10));
    }
  });

  const onSubmit = async (data: any) => {
    const propertyData = {
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      city: data.city,
      district: data.district,
      email: data.email,
      phoneNumber: data.phoneNumber,
      images: images,  // Default image
      rooms: parseInt(data.rooms, 10) || 1,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/gproperties/addproperty", propertyData);
      
      if (response.data.success) {
        alert("Property added successfully!");
        navigate("/gproperties");  // Navigate to properties listing page
      } else {
        alert("Failed to add property. Please try again.");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground">Create a new property listing</p>
      </div>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Guesthouse Name</label>
          <Input placeholder="e.g. Ocean View Suite" {...form.register("name")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea placeholder="Describe your property..." {...form.register("description")} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Rooms</label>
          <Input type="number" min="1" {...form.register("rooms")} />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Location</h2>
        <Input placeholder="Street Address" {...form.register("streetAddress")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder="City" {...form.register("city")} />
          <Input placeholder="District" {...form.register("district")} />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input type="email" placeholder="your@email.com" {...form.register("email")} />
          <Input placeholder="+977 980XXXXXXX" {...form.register("phoneNumber")} />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Property Images</h2>
        <div {...getRootProps()} className="border-dashed border-2 rounded-lg p-6 text-center cursor-pointer">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            <p className="text-sm">Drag & drop images here, or click to select files</p>
            <p className="text-xs text-muted-foreground">JPEG, JPG, PNG, or WebP (max 10 images)</p>
          </div>
        </div>

        {/* {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            <img src="/placeholder.png" className="mx-auto h-20 opacity-30" alt="No images" />
            <p>No images uploaded</p>
          </div>
        )} */}
      </section>

      <div className="text-right">
        <Button type="submit">Create Property</Button>
      </div>
    </form>
  );
}

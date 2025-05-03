import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { Input } from "../gcomponents/input";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import placeholderImage from "../images/placeholder.png";

type FileWithPreview = File & { preview: string };

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const form = useForm();
  const [images, setImages] = useState<(string | FileWithPreview)[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/gproperties/${id}`);
        const data = await response.json();

        if (data.success) {
          const property = data.property;
          form.setValue("name", property.name);
          form.setValue("description", property.description);
          form.setValue("rooms", property.rooms);
          form.setValue("streetAddress", property.address.split(",")[0]?.trim());
          form.setValue("city", property.address.split(",")[1]?.trim());
          form.setValue("district", property.address.split(",")[2]?.trim());
          form.setValue("email", property.email);
          form.setValue("phoneNumber", property.contact);
          setImages(property.images);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setNotFound(true);
      }
    };

    fetchProperty();
  }, [id, form]);

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
    const updatedProperty = {
      id,
      name: data.name,
      description: data.description,
      address: `${data.streetAddress}, ${data.city}, ${data.district}`,
      email: data.email,
      contact: data.phoneNumber,
      rooms: parseInt(data.rooms, 10) || 1,
    };

    const formData = new FormData();
    formData.append("property", JSON.stringify(updatedProperty));

    // images.forEach((image) => {
    //   if (typeof image === "string") {
    //     formData.append("existingImages", image); // for server to retain existing ones
    //   } else {
    //     formData.append("newImages", image); // new uploads
    //   }
    // });

    try {
      const url = `http://localhost:5000/api/gproperties/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProperty),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert("Property updated successfully!");
        navigate("/gproperties");
      } else {
        alert(`Error updating property: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating property");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <p className="text-muted-foreground">Update your property listing</p>
      </div>

      {notFound && <p className="text-red-500">Property not found or error fetching details.</p>}

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Guesthouse Name
          </label>
          <Input
            id="name"
            {...form.register("name", { required: "Guesthouse name is required" })}
            placeholder="e.g. Ocean View Suite"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <Textarea
            placeholder="Describe your property..."
            {...form.register("description", { required: "Description is required" })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="rooms">
            Number of Rooms
          </label>
          <Input
            id="rooms"
            type="number"
            min="1"
            {...form.register("rooms", { required: "Number of rooms is required" })}
          />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Location</h2>
        <Input
          id="streetAddress"
          placeholder="Street Address"
          {...form.register("streetAddress", { required: "Street address is required" })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="city"
            placeholder="City"
            {...form.register("city", { required: "City is required" })}
          />
          <Input
            id="district"
            placeholder="District"
            {...form.register("district", { required: "District is required" })}
          />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...form.register("email", { required: "Email is required" })}
          />
          <Input
            id="phoneNumber"
            placeholder="+977 980XXXXXXX"
            {...form.register("phoneNumber", { required: "Phone number is required" })}
          />
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
            {images.map((img, i) => (
              <img
                key={i}
                src={typeof img === "string" ? img : img.preview}
                alt={`Uploaded ${i}`}
                className="rounded-lg h-28 object-cover w-full"
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <img src={placeholderImage} className="mx-auto h-20 opacity-30" alt="No images" />
            <p>No images uploaded</p>
          </div>
        )} */}
      </section>

      <div className="text-right">
        <Button type="submit">Update Property</Button>
      </div>
    </form>
  );
}
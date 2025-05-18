import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { Input } from "../gcomponents/input";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const form = useForm();
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
          form.setValue("images", property.images);
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


  const onSubmit = async (data: any) => {
    const updatedProperty = {
      id,
      name: data.name,
      description: data.description,
      address: `${data.streetAddress}, ${data.city}, ${data.district}`,
      email: data.email,
      contact: data.phoneNumber,
      images: data.images,
      rooms: parseInt(data.rooms, 10) || 1,
    };

    const formData = new FormData();
    formData.append("property", JSON.stringify(updatedProperty));

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
        <div>
          <Input placeholder="Enter image url" {...form.register("images")} />
        </div>
      </section>

      <div className="text-right">
        <Button type="submit">Update Property</Button>
      </div>
    </form>
  );
}
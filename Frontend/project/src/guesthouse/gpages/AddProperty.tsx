import { useForm } from "react-hook-form";
import { Input } from "../gcomponents/input";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { useNavigate } from "react-router-dom";

interface PropertyFormData {
  name: string;
  description: string;
  streetAddress: string;
  city: string;
  district: string;
  email: string;
  phoneNumber: string;
  images: string;
}

export default function AddProperty() {
  const form = useForm<PropertyFormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: PropertyFormData) => {
    const propertyData = {
      name: data.name,
      description: data.description,
      streetAddress: data.streetAddress,
      city: data.city,
      district: data.district,
      email: data.email,
      phoneNumber: data.phoneNumber,
      images: data.images,
    };

    try {
      const response = await fetch("http://localhost:5000/api/gproperties/addproperty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add property");
      }

      if (responseData.success) {
        alert("Property added successfully!");
        navigate("/gproperties");
      } else {
        alert(responseData.message || "Failed to add property. Please try again.");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert(error instanceof Error ? error.message : "An error occurred. Please try again.");
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
        <div>
          <Input placeholder="Enter image url" {...form.register("images")} />
        </div>
      </section>

      <div className="text-right">
        <Button type="submit">Create Property</Button>
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "../gcomponents/textarea";
import { Button } from "../gcomponents/button";
import { Input } from "../gcomponents/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../gcomponents/select";
import { useNavigate, useParams } from "react-router-dom";

export default function EditRoom() {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const form = useForm();
  const [available, setAvailable] = useState("true");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/gproperties/${id}/rooms/${roomId}`
        );
        const data = await response.json();

        if (data.success) {
          const room = data.room;
          form.setValue("name", room.name);
          form.setValue("capacity", room.capacity);
          form.setValue("price", room.price);
          form.setValue("amenities", room.amenities?.join(", ") || "");
          setAvailable(room.available ? "true" : "false");
          form.setValue("images", room.images);
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
      images: data.images,
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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold">Edit Room</h1>
        <p className="text-muted-foreground">Update your room details</p>
      </div>

      {notFound && (
        <p className="text-red-500">
          Room not found or error fetching details.
        </p>
      )}

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
            {...form.register("capacity", {
              required: "Room capacity is required",
            })}
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
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="amenities"
          >
            Amenities
          </label>
          <Textarea
            id="amenities"
            placeholder="WiFi, AC, TV"
            {...form.register("amenities", {
              required: "Room amenities are required",
            })}
          />
        </div>
      </section>

      <section className="space-y-4 border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Room Images</h2>
        <div>
          <Input
            placeholder="Enter image URL"
            {...form.register("images")}
          />
        </div>
      </section>

      <div className="text-right">
        <Button type="submit">Update Room</Button>
      </div>
    </form>
  );
}

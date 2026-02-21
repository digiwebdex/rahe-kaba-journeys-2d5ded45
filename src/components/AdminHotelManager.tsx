import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Building2, Bed, Star, Trash2 } from "lucide-react";

interface Props {
  hotels: any[];
  onRefresh: () => void;
}

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const AdminHotelManager = ({ hotels, onRefresh }: Props) => {
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState<string | null>(null);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Record<string, any[]>>({});

  const [hotelForm, setHotelForm] = useState({
    name: "", location: "", city: "Makkah", description: "",
    star_rating: "5", distance_to_haram: "", image_url: "",
    amenities: "",
  });

  const [roomForm, setRoomForm] = useState({
    name: "", description: "", capacity: "2", price_per_night: "", image_url: "",
  });

  const fetchRooms = async (hotelId: string) => {
    const { data } = await supabase.from("hotel_rooms").select("*").eq("hotel_id", hotelId).order("price_per_night");
    setRooms((prev) => ({ ...prev, [hotelId]: data || [] }));
  };

  const toggleExpand = (hotelId: string) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
    } else {
      setExpandedHotel(hotelId);
      if (!rooms[hotelId]) fetchRooms(hotelId);
    }
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArr = hotelForm.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const { error } = await supabase.from("hotels").insert({
      name: hotelForm.name,
      location: hotelForm.location,
      city: hotelForm.city,
      description: hotelForm.description || null,
      star_rating: parseInt(hotelForm.star_rating),
      distance_to_haram: hotelForm.distance_to_haram || null,
      image_url: hotelForm.image_url || null,
      amenities: amenitiesArr,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Hotel added");
    setShowHotelForm(false);
    setHotelForm({ name: "", location: "", city: "Makkah", description: "", star_rating: "5", distance_to_haram: "", image_url: "", amenities: "" });
    onRefresh();
  };

  const handleCreateRoom = async (e: React.FormEvent, hotelId: string) => {
    e.preventDefault();
    const { error } = await supabase.from("hotel_rooms").insert({
      hotel_id: hotelId,
      name: roomForm.name,
      description: roomForm.description || null,
      capacity: parseInt(roomForm.capacity),
      price_per_night: parseFloat(roomForm.price_per_night),
      image_url: roomForm.image_url || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Room added");
    setShowRoomForm(null);
    setRoomForm({ name: "", description: "", capacity: "2", price_per_night: "", image_url: "" });
    fetchRooms(hotelId);
  };

  const toggleHotelActive = async (hotel: any) => {
    const { error } = await supabase.from("hotels").update({ is_active: !hotel.is_active }).eq("id", hotel.id);
    if (error) { toast.error(error.message); return; }
    toast.success(hotel.is_active ? "Hotel deactivated" : "Hotel activated");
    onRefresh();
  };

  const toggleRoomAvailable = async (room: any, hotelId: string) => {
    const { error } = await supabase.from("hotel_rooms").update({ is_available: !room.is_available }).eq("id", room.id);
    if (error) { toast.error(error.message); return; }
    toast.success(room.is_available ? "Room marked unavailable" : "Room marked available");
    fetchRooms(hotelId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg font-bold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Hotels
        </h3>
        <button
          onClick={() => setShowHotelForm(!showHotelForm)}
          className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2"
        >
          {showHotelForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showHotelForm ? "Cancel" : "Add Hotel"}
        </button>
      </div>

      {showHotelForm && (
        <form onSubmit={handleCreateHotel} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Hotel Name *" required value={hotelForm.name} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} />
          <input className={inputClass} placeholder="Location (e.g. Near Haram)" required value={hotelForm.location} onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })} />
          <select className={inputClass} value={hotelForm.city} onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}>
            <option value="Makkah">Makkah</option>
            <option value="Madinah">Madinah</option>
            <option value="Jeddah">Jeddah</option>
          </select>
          <select className={inputClass} value={hotelForm.star_rating} onChange={(e) => setHotelForm({ ...hotelForm, star_rating: e.target.value })}>
            {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} Star</option>)}
          </select>
          <input className={inputClass} placeholder="Distance to Haram (e.g. 200m)" value={hotelForm.distance_to_haram} onChange={(e) => setHotelForm({ ...hotelForm, distance_to_haram: e.target.value })} />
          <input className={inputClass} placeholder="Image URL (optional)" value={hotelForm.image_url} onChange={(e) => setHotelForm({ ...hotelForm, image_url: e.target.value })} />
          <input className={`${inputClass} sm:col-span-2`} placeholder="Amenities (comma-separated: WiFi, Parking, Restaurant)" value={hotelForm.amenities} onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })} />
          <textarea className={`${inputClass} sm:col-span-2`} placeholder="Description" rows={2} value={hotelForm.description} onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Create Hotel</button>
        </form>
      )}

      <div className="space-y-3">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleExpand(hotel.id)}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{hotel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {hotel.city} • {hotel.star_rating}★ • {hotel.distance_to_haram || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleHotelActive(hotel); }}
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${hotel.is_active ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive"}`}
                >
                  {hotel.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {expandedHotel === hotel.id && (
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-primary" /> Rooms
                  </h4>
                  <button
                    onClick={() => setShowRoomForm(showRoomForm === hotel.id ? null : hotel.id)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {showRoomForm === hotel.id ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {showRoomForm === hotel.id ? "Cancel" : "Add Room"}
                  </button>
                </div>

                {showRoomForm === hotel.id && (
                  <form onSubmit={(e) => handleCreateRoom(e, hotel.id)} className="bg-secondary/50 rounded-lg p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input className={inputClass} placeholder="Room Name *" required value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
                    <input className={inputClass} placeholder="Capacity" type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
                    <input className={inputClass} placeholder="Price/Night (BDT) *" type="number" required value={roomForm.price_per_night} onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })} />
                    <input className={inputClass} placeholder="Image URL" value={roomForm.image_url} onChange={(e) => setRoomForm({ ...roomForm, image_url: e.target.value })} />
                    <input className={`${inputClass} col-span-2 sm:col-span-3`} placeholder="Description" value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} />
                    <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2 rounded-md text-xs">Add</button>
                  </form>
                )}

                {(rooms[hotel.id] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No rooms added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(rooms[hotel.id] || []).map((room) => (
                      <div key={room.id} className="bg-secondary/30 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{room.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Capacity: {room.capacity} • ৳{Number(room.price_per_night).toLocaleString()}/night
                          </p>
                        </div>
                        <button
                          onClick={() => toggleRoomAvailable(room, hotel.id)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${room.is_available ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive"}`}
                        >
                          {room.is_available ? "Available" : "Unavailable"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {hotels.length === 0 && <p className="text-center text-muted-foreground py-12">No hotels yet. Add your first hotel above.</p>}
      </div>
    </div>
  );
};

export default AdminHotelManager;

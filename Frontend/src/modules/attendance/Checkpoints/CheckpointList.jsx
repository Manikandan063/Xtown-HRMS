import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Navigation, 
  Crosshair,
  Loader2,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import PageLoader from '@/components/ui/PageLoader';

const CheckpointList = () => {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 100
  });

  const fetchCheckpoints = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/checkpoints');
      setCheckpoints(res.data || []);
    } catch (error) {
      toast.error("Failed to load attendance locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/checkpoints/${editingId}` : '/checkpoints';
      
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      
      toast.success(editingId ? "Location updated." : "New location added.");
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', latitude: '', longitude: '', radius: 100 });
      fetchCheckpoints();
    } catch (error) {
      toast.error(error.message || "Failed to save checkpoint.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await apiFetch(`/checkpoints/${id}`, { method: 'DELETE' });
      toast.success("Location deleted.");
      fetchCheckpoints();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser.");
    }
    
    toast.loading("Finding current position...", { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        toast.success("Position found.", { id: 'geo' });
      },
      (err) => {
        toast.error("Finding location failed: " + err.message, { id: 'geo' });
      },
      { enableHighAccuracy: true }
    );
  };

  if (loading && checkpoints.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-primary">Attendance Locations</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Define locations for selfie attendance verification.</p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', latitude: '', longitude: '', radius: 100 });
          }}
          className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 gap-2 font-black uppercase text-[10px] tracking-widest"
        >
          {showForm ? 'Cancel' : <><Plus className="h-4 w-4" /> Add Location</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card/70 backdrop-blur-xl ring-1 ring-border animate-in slide-in-from-top-4">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Location Name</Label>
                  <Input 
                    placeholder="e.g. Main Gate, Office Reception"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="h-12 rounded-xl bg-muted border-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Allowed Radius (Meters)</Label>
                  <Input 
                    type="number"
                    value={formData.radius}
                    onChange={e => setFormData({...formData, radius: e.target.value})}
                    className="h-12 rounded-xl bg-muted border-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Latitude</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={e => setFormData({...formData, latitude: e.target.value})}
                      className="h-12 rounded-xl bg-muted border-none font-bold pr-12"
                      required
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Longitude</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={e => setFormData({...formData, longitude: e.target.value})}
                      className="h-12 rounded-xl bg-muted border-none font-bold pr-12"
                      required
                    />
                    <Navigation className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={getCurrentLocation}
                  className="flex-1 rounded-xl h-12 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-primary/5"
                >
                  <Crosshair className="h-4 w-4" /> Find My Current Location
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest"
                >
                  {editingId ? 'Update Location' : 'Save Location'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkpoints.map(cp => (
          <Card key={cp.id} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-card hover:shadow-2xl transition-all group ring-1 ring-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      setEditingId(cp.id);
                      setFormData({
                        name: cp.name,
                        latitude: cp.latitude,
                        longitude: cp.longitude,
                        radius: cp.radius
                      });
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDelete(cp.id)}
                    className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-black text-lg tracking-tighter text-foreground mb-1">{cp.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Radius</span>
                  <Badge variant="outline" className="rounded-lg text-[9px] font-black border-primary/20 text-primary">{cp.radius}m</Badge>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                  <p className="text-[10px] font-mono font-bold flex justify-between">
                    <span className="opacity-40">LAT:</span> 
                    <span>{cp.latitude}</span>
                  </p>
                  <p className="text-[10px] font-mono font-bold flex justify-between">
                    <span className="opacity-40">LNG:</span> 
                    <span>{cp.longitude}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {checkpoints.length === 0 && !loading && !showForm && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-30">
            <MapPin className="h-16 w-16 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs italic">No locations found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointList;

import React, { useState, useRef, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const SelfieAttendanceModal = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('INIT'); // INIT, CAPTURE, PREVIEW, SUCCESS
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startFlow = async () => {
    setLoading(true);
    setStep('INIT');
    setImage(null);
    
    // 1. Get Location
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported. Cannot proceed with geofenced attendance.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        startCamera();
      },
      (err) => {
        toast.error("Location access is required for selfie attendance: " + err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false 
      });
      setStream(mediaStream);
      setStep('CAPTURE'); // Set step first so video element renders
    } catch (err) {
      toast.error("Camera access denied. Please enable camera permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Ensure stream is attached when video element becomes available
  React.useEffect(() => {
    if (step === 'CAPTURE' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    // Cleanup: Stop camera when component unmounts or step changes from CAPTURE
    return () => {
      if (step !== 'CAPTURE' && step !== 'PREVIEW' && stream) {
        // We only stop if we aren't in a state that needs it
        // Actually, simpler: stop on unmount
      }
    };
  }, [step, stream]);

  // Comprehensive cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setImage(dataUrl);
      setStep('PREVIEW');
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/attendance/selfie-punch', {
        method: 'POST',
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          imageUrl: image
        })
      });

      if (res.success) {
        setStep('SUCCESS');
        toast.success(res.message);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit attendance.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    stopCamera();
    setStep('INIT');
    setImage(null);
    setLocation(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      setOpen(val);
    }}>
      <DialogTrigger asChild>
        <Button 
          onClick={startFlow}
          className="rounded-2xl h-11 px-6 shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest gap-2"
        >
          <Camera className="h-4 w-4" /> Selfie Attendance
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-card border-none shadow-2xl p-0 overflow-hidden outline-none">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" /> Selfie Attendance Backup
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic pt-1 opacity-60">
              Selfie Location Verification
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-square rounded-[2rem] bg-muted overflow-hidden border-2 border-dashed border-primary/20 flex items-center justify-center">
            {step === 'INIT' && (
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                  <MapPin className="h-8 w-8" />
                </div>
                <h4 className="font-black uppercase tracking-widest text-xs italic">Locating you...</h4>
                <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">Please ensure GPS is enabled. We are finding the nearest attendance point.</p>
              </div>
            )}

            {step === 'CAPTURE' && (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40">
                  <div className="w-full h-full border-2 border-white/50 rounded-[1.5rem] flex items-center justify-center">
                    <div className="w-48 h-64 border-2 border-dashed border-white/80 rounded-full opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {step === 'PREVIEW' && (
              <img src={image} className="w-full h-full object-cover scale-x-[-1]" alt="Selfie Capture" />
            )}

            {step === 'SUCCESS' && (
              <div className="flex flex-col items-center gap-4 text-center p-8 animate-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h4 className="font-black uppercase tracking-widest text-lg italic text-emerald-500">Verified</h4>
                <p className="text-xs text-muted-foreground font-bold">Attendance marked successfully. You may close this window.</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-8 space-y-4">
            {location && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Localized Coords</p>
                    <p className="text-[10px] font-mono font-bold">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg text-[9px] font-black">GPS ACTIVE</Badge>
              </div>
            )}

            {step === 'CAPTURE' && (
              <Button 
                onClick={capturePhoto}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-3"
              >
                <Camera className="h-5 w-5" /> Capture Presence
              </Button>
            )}

            {step === 'PREVIEW' && (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep('INIT');
                    startFlow();
                  }}
                  disabled={loading}
                  className="h-14 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest gap-2"
                >
                  <RefreshCcw className={loading ? "animate-spin" : ""} /> Retake
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} 
                  {loading ? 'Verifying...' : 'Submit Log'}
                </Button>
              </div>
            )}

            {step === 'SUCCESS' && (
              <Button 
                onClick={() => setOpen(false)}
                className="w-full h-14 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest"
              >
                Close Protocol
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-primary/5 p-4 flex items-center gap-3 border-t border-primary/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-[9px] font-bold text-muted-foreground leading-tight">
            <span className="text-foreground">Security Note:</span> Captured images are geostamped and verified against organization checkpoints. Attempting to spoof location or identity will result in administrative flagging.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelfieAttendanceModal;

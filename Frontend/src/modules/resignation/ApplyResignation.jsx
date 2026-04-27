import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import resignationService from '@/services/resignationService';
import { toast } from 'sonner';

const ApplyResignation = () => {
  const [formData, setFormData] = useState({
    reason: '',
    lastWorkingDate: '',
    noticePeriod: 30,
    comments: ''
  });
  const [myResignation, setMyResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyResignation();
    // Default LWD to today + 30 days
    const defaultLWD = new Date();
    defaultLWD.setDate(defaultLWD.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      lastWorkingDate: defaultLWD.toISOString().split('T')[0]
    }));
  }, []);

  const fetchMyResignation = async () => {
    try {
      const res = await resignationService.getMyResignation();
      setMyResignation(res.data);
    } catch (error) {
      console.error('Error fetching resignation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resignationService.applyResignation(formData);
      toast.success('Resignation request submitted successfully');
      fetchMyResignation();
    } catch (error) {
      toast.error(error.message || 'Failed to submit resignation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your resignation request?')) return;
    
    setLoading(true);
    try {
      await resignationService.cancelResignation(myResignation.id);
      toast.success('Resignation request cancelled');
      setMyResignation(null);
    } catch (error) {
      toast.error('Failed to cancel resignation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (myResignation) {
    const isApproved = myResignation.status === 'approved';
    const isCompleted = myResignation.status === 'completed';
    
    // Countdown logic
    const lwd = new Date(myResignation.lastWorkingDate);
    const today = new Date();
    const diffTime = lwd - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">My Resignation</h1>
          <Badge className={`px-4 py-1 text-sm rounded-full ${
            myResignation.status === 'approved' ? 'bg-green-100 text-green-700' : 
            myResignation.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {myResignation.status?.toUpperCase() || 'PENDING'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Resignation Date</Label>
                  <p className="font-medium">
                    {myResignation.resignationDate ? new Date(myResignation.resignationDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Working Day</Label>
                  <p className="font-medium text-red-600">
                    {myResignation.lastWorkingDate ? new Date(myResignation.lastWorkingDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reason</Label>
                <p className="font-medium italic text-slate-600">"{myResignation.reason}"</p>
              </div>
              {myResignation.comments && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Comments</Label>
                  <p className="text-sm text-slate-500">{myResignation.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[200px]">
              <Clock className="h-10 w-10 opacity-80" />
              <div>
                <h3 className="text-sm font-medium opacity-80 uppercase tracking-widest">Notice Period</h3>
                <p className="text-4xl font-black mt-1">
                  {diffDays > 0 ? diffDays : 0} <span className="text-lg font-normal opacity-70">Days</span>
                </p>
                <p className="text-xs mt-2 opacity-70">Remaining until exit</p>
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                {diffDays <= 0 ? 'Notice Completed' : 'In Notice Period'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {myResignation.status === 'pending' && (
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm"
          >
            Cancel Resignation Request
          </Button>
        )}

        {isApproved && myResignation.checklistItems?.length > 0 && (
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Exit Checklist Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {myResignation.checklistItems.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-slate-300 animate-pulse'}`} />
                      <span className={`font-medium ${item.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.task}
                      </span>
                    </div>
                    <Badge variant="outline" className={item.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-50'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Resignation Notice</h1>
        <p className="text-slate-500 font-medium italic">We're sorry to see you go. Please provide the details below.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-bold text-slate-700 ml-1">Reason for Leaving</Label>
              <Input
                id="reason"
                placeholder="e.g. Better Opportunity, Personal Reasons"
                required
                className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lwd" className="text-sm font-bold text-slate-700 ml-1 text-red-500">Requested Last Working Day</Label>
                <div className="relative">
                  <Input
                    id="lwd"
                    type="date"
                    required
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500 pl-10"
                    value={formData.lastWorkingDate}
                    onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
                  />
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice" className="text-sm font-bold text-slate-700 ml-1">Notice Period (Days)</Label>
                <div className="relative">
                  <Input
                    id="notice"
                    type="number"
                    required
                    readOnly
                    className="h-12 rounded-xl bg-slate-100 border-none focus-visible:ring-0 pl-10 cursor-not-allowed opacity-70"
                    value={formData.noticePeriod}
                  />
                  <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-bold text-slate-700 ml-1">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Any further details you'd like to share..."
                className="min-h-[120px] rounded-2xl bg-slate-50 border-none focus-visible:ring-indigo-500 resize-none p-4"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <p>Once submitted, your resignation request will be sent to HR for approval. You can track the status here.</p>
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {submitting ? 'Submitting Request...' : 'Submit Resignation Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyResignation;

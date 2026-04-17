import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { PROJECT_COLORS } from '@/lib/calendarUtils';

export default function ClientDialog({ open, onOpenChange, client, onSave, onDelete }: any) {
  const [form, setForm] = useState({
    name: '', company: '', email: '', color: PROJECT_COLORS[0],
    is_retainer: false, retainer_hours: 0, notes: '',
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        color: client.color || PROJECT_COLORS[0],
        is_retainer: client.is_retainer || false,
        retainer_hours: client.retainer_hours || 0,
        notes: client.notes || '',
      });
    } else {
      setForm({
        name: '', company: '', email: '',
        color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
        is_retainer: false, retainer_hours: 0, notes: '',
      });
    }
  }, [client, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{client?.id ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Client Name *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" className="h-9" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@email.com" className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Colour</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs font-medium">Retainer Client</p>
              <p className="text-[10px] text-muted-foreground">Has recurring monthly deliverables</p>
            </div>
            <Switch checked={form.is_retainer} onCheckedChange={v => setForm({ ...form, is_retainer: v })} />
          </div>
          {form.is_retainer && (
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Retainer Hours</Label>
              <Input type="number" min="0" step="0.5" value={form.retainer_hours} onChange={e => setForm({ ...form, retainer_hours: parseFloat(e.target.value) || 0 })} className="h-9" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this client..." className="h-9" />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {client?.id && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(client.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={() => onSave({ ...form, name: form.name || 'Untitled Client' })}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
